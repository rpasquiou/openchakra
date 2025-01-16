const moment=require('moment')
const mongoose=require('mongoose')
const Block = require('../../models/Block')
const Session = require('../../models/Session')
const { ForbiddenError, BadRequestError, NotFoundError } = require('../../utils/errors')
const {addAction, setAllowActionFn}=require('../../utils/studio/actions')
const { ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLES, BLOCK_STATUS_FINISHED,ROLE_HELPDESK, ROLE_APPRENANT, RESOURCE_TYPE_SCORM, BLOCK_STATUS_CURRENT, ROLE_ADMINISTRATEUR, BLOCK_TYPE_RESOURCE, VISIO_TYPE_GROUP, VISIO_TYPE_SESSION, BLOCK_TYPE_PROGRAM } = require('./consts')
const { onBlockFinished, getNextResource, getPreviousResource, getParentBlocks, getSession, updateChildrenOrder, cloneTemplate, addChild, getTemplate, lockSession, onBlockAction, getBlockStatus, saveBlockStatus, getSessionProof, getSessionBlocks, ensureValidProgramProduction } = require('./block')
const Progress = require('../../models/Progress')
const { canPlay, canResume, canReplay, getMandatoryResourcesCount, getAllResourcesCount } = require('./resources')
const User = require('../../models/User')
const { setpreLogin, getModel, idEqual } = require('../../utils/database')
const { sendForgotPassword } = require('./mailing')
const { addVisioSpentTime } = require('../visio/functions')
const { getSessionCertificate } = require('./program')

const preLogin = async ({email}) => {
  const user=await User.findOne({email})
  if (user && [ROLE_APPRENANT].includes(user.role)) {
    const currentExists=await Session.exists({_locked: true, trainees: user, start_date: {$lte: moment()}, end_date: {$gte: moment()}})
    if (!currentExists) {
      throw new Error(`Vous n'avez pas de session en cours`)
    }
  }
}

setpreLogin(preLogin)

const moveChildInParent= async (childId, up) => {
  const delta=up ? -1 : 1
  const child=await Block.findById(childId).populate({path: 'parent', populate: 'children_count'})
  if (!child.parent) {
    console.error('*'.repeat(50), `Child ${child} has no parent`)
    return
  }
  const childrenCount=child.parent.children_count
  const newOrder=child.order+delta
  if (newOrder<1) {
    throw new ForbiddenError(`Déjà en tête de liste`)
  }
  if (newOrder>childrenCount) {
    throw new ForbiddenError(`Déjà en fin de liste`)
  }
  const brother=await Block.findOne({parent: child.parent, order: child.order+delta})
  if (!brother) {
    throw new Error(`No brother found in parent ${child.parent} with order ${child.order+delta}`)
  }
  child.order=newOrder
  brother.order=brother.order-delta
  await Promise.all([child.save(), brother.save()])
  const linkedBlocks=await Block.find({origin: childId, _locked: false})
  return Promise.all(linkedBlocks.map(block => moveChildInParent(block._id, up)))
}

const addChildAction = async ({parent, child}, user) => {
  const res=await addChild({parent, child, user})
  const mandatory_count=await getMandatoryResourcesCount(user._id, null, {_id: parent})
  const all_count=await getAllResourcesCount(user._id, null, {_id: parent})
  await Block.findByIdAndUpdate(parent, {mandatory_resources_count: mandatory_count, resources_count: all_count})
}
addAction('addChild', addChildAction)

const removeChildAction = async ({parent, child}, user) => {
  console.log('removing', child, 'from', parent)
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  await Block.findByIdAndDelete(child)
  await Block.findByIdAndUpdate(parent, {last_updater: user})
  await updateChildrenOrder(parent)
  // Propagate deletion
  const linkedChildren=await Block.find({origin: child, _locked: false}).populate('parent')
  await Promise.all(linkedChildren.map(linkedChild => removeChildAction({parent: linkedChild.parent._id, child: linkedChild._id}, user)))
  const mandatory_count=await getMandatoryResourcesCount(user._id, null, {_id: parent})
  const all_count=await getAllResourcesCount(user._id, null, {_id: parent})
  await Block.findByIdAndUpdate(parent, {mandatory_resources_count: mandatory_count, resources_count: all_count})
}
addAction('removeChild', removeChildAction)

const levelUpAction = ({child}, user) => {
  return moveChildInParent(child, true)
}
addAction('levelUp', levelUpAction)

const levelDownAction = ({child}, user) => {
  return moveChildInParent(child, false)
}
addAction('levelDown', levelDownAction)

const addSpentTimeAction = async ({id, duration}, user) => {
  const model=await getModel(id)
  if (model=='visio') {
     await addVisioSpentTime({visio: id, user, duration: duration})
     const visio=await mongoose.models.visio.findById(id)
      .populate({path: '_owner', populate: 'sessions'})
    if ([VISIO_TYPE_SESSION, VISIO_TYPE_GROUP].includes(visio.type)) {
      let sessions=(visio._owner.sessions || [visio._owner]).filter(s => s.trainees.some(t => idEqual(t, user._id))).map(s => s._id)
      await Progress.updateMany({block: {$in: sessions}, user: user._id}, {$inc: {spent_time: duration/1000}})
    }
  }
  if (model==BLOCK_TYPE_RESOURCE) {
    const toUpdate=[id, ...(await getParentBlocks(id))]
    await Promise.all(toUpdate.map(async blockId => {
      // Increase spent time
      await Progress.findOneAndUpdate(
        {user, block: blockId},
        {user, block: blockId, $inc: {spent_time: duration/1000}},
        {upsert: true, new: true}
      )
      // Set status to current if not already finished
      const currentStatus=await getBlockStatus(user._id, null, {_id: id})
      // Set to current if not already finished
      if (![BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED].includes(currentStatus)) {
        await saveBlockStatus(user._id, id, BLOCK_STATUS_CURRENT)
      }
    }))
    return onBlockAction(user._id, id)
  }
}

addAction('addSpentTime', addSpentTimeAction)

const lockSessionAction = async ({value}, user) => {
  return lockSession(value)
}
addAction('lockSession', lockSessionAction)

const resourceAction = action => async ({value}, user) => {
  await isActionAllowed({action, dataId: value, user})
  return  {_id: value}
}

addAction('play', resourceAction('play'))
addAction('resume', resourceAction('resume'))
addAction('replay', resourceAction('replay'))

addAction('next', async ({id}, user) => getNextResource(id, user))

addAction('previous', async ({id}, user) => getPreviousResource(id, user))

const clone = async ({value}, user) => {
  return cloneTemplate(value, user)
}

addAction('clone', clone)


const getSessionAction = async ({id}, user) => {
  return getSession(user._id, null, {_id: id}, [])
}
  
addAction('session', getSessionAction)

const getTemplateAction = async ({value}, user) => {
  return getTemplate(value)
}
  
addAction('get_template', getTemplateAction)


// TODO dev only
const forceFinishResource = async ({value, dataId, trainee}, user) => {
  if(![ROLE_HELPDESK, ROLE_FORMATEUR].includes(user.role) && dataId) {
    throw new ForbiddenError(`Déblocage non autorisé`)
  }
  user = await User.findById(trainee)
  const block=await Block.findById(value)
  await onBlockFinished(user._id, block)
}

addAction('alle_finish_mission', forceFinishResource)


const forgotPasswordAction = async ({email}) => {
  console.log('value', email)
  const user=await User.findOne({email})
  if (user) {
    return sendForgotPassword({user})
  }
}

addAction('forgotPassword', forgotPasswordAction)


const getSessionProofAction = async ({value}, user) => {
  const session=await Session.findById(value).populate('trainees')
  const proof=await getSessionProof(user, null, session, [], user)
  return proof
}
addAction('get_proof', getSessionProofAction)

const getSessionCertificateAction = async ({value}, user) => {
  const session=await Session.findById(value).populate(['trainees', 'children'])
  const certificate=await getSessionCertificate(user, null, session)
  return certificate
}
addAction('get_certificate', getSessionCertificateAction)

/**
  Validate action:
  - program : ensure it can be toggle to produciton mode
*/
const validateAction = async ({value}, user) => {
  const isProgram=await Block.exists({_id: value, type: BLOCK_TYPE_PROGRAM})
  if (isProgram) {
    return ensureValidProgramProduction(value)
  }
}
addAction('validate', validateAction)

const isActionAllowed = async ({ action, dataId, user }) => {
  if (action=='clone') {
    if (![ROLE_CONCEPTEUR, ROLE_ADMINISTRATEUR].includes(user?.role)) { throw new ForbiddenError(`Action non autorisée`)}
    const block=await Block.findById(dataId, {origin:1})
    if (!!block.origin) {
      throw new BadRequestError(`Seul un modèle peut être dupliqué`)
    }
  }
  if (action=='addChild') {
    if (![ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLE_ADMINISTRATEUR].includes(user?.role)) { throw new ForbiddenError(`Action non autorisée`)}
  }
  const actionFn={'play': canPlay, 'resume': canResume, 'replay': canReplay}[action]
  if (actionFn) {
    const allowed=await actionFn({action, dataId, user})
    if (!allowed) {
      throw new BadRequestError(`Action ${action} interdite`)
    }
  }
  if (action=='next') {
    console.time('Next')
    await getNextResource(dataId, user)
    console.timeEnd('Next')
 }
  if (action=='previous') {
    await getPreviousResource(dataId, user)
  }
  if (['get_proof', 'get_certificate'].includes(action)) {
    const session=await Session.findById(dataId)
    if (!session) {
      throw new NotFoundError(`Session ${dataId} introuvable`)
    }
    if (action=='get_proof' && moment().isBefore(session.start_date)) {
      throw new BadRequestError(`La session n'a pas commencé`)
    }
    if (action=='get_certificate' && moment().endOf('day').isBefore(session.end_date)) {
      throw new BadRequestError(`La session n'est pas terminée`)
    }
  }
  if (action=='get_certificate') {
  }

  return true
}

setAllowActionFn(isActionAllowed)

module.exports={
  // Exported for programs import
  addChildAction
}
