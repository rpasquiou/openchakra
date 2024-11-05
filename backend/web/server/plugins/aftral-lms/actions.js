const moment=require('moment')
const Block = require('../../models/Block')
const Session = require('../../models/Session')
const { ForbiddenError, BadRequestError } = require('../../utils/errors')
const {addAction, setAllowActionFn}=require('../../utils/studio/actions')
const { ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLES, BLOCK_STATUS_FINISHED,ROLE_HELPDESK, ROLE_APPRENANT, RESOURCE_TYPE_SCORM, BLOCK_STATUS_CURRENT, ROLE_ADMINISTRATEUR } = require('./consts')
const { onBlockFinished, getNextResource, getPreviousResource, getParentBlocks, getSession, updateChildrenOrder, cloneTemplate, addChild, getTemplate, lockSession, onBlockAction } = require('./block')
const Progress = require('../../models/Progress')
const { canPlay, canResume, canReplay } = require('./resources')
const User = require('../../models/User')
const { setpreLogin } = require('../../utils/database')
const { sendForgotPassword } = require('./mailing')

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
  return addChild({parent, child, user})
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
  const toUpdate=[id, ...(await getParentBlocks(id))]
  await Promise.all(toUpdate.map(async blockId => {
    // Increase spent time
    await Progress.findOneAndUpdate(
      {user, block: blockId},
      {user, block: blockId, $inc: {spent_time: duration/1000}},
      {upsert: true, new: true}
    )
    // Set status to current if not already finished
    await Progress.findOneAndUpdate(
      {user, block: blockId, achievement_status: {$ne: BLOCK_STATUS_FINISHED}},
      {user, block: blockId, achievement_status: BLOCK_STATUS_CURRENT}
    )
  }))
  return onBlockAction(user._id, id)
}

addAction('addSpentTime', addSpentTimeAction)

const lockSessionAction = async ({value}, user) => {
  return lockSession(value, user)
}
addAction('lockSession', lockSessionAction)

const resourceAction = action => async ({value}, user) => {
  return isActionAllowed({action, dataId: value, user}) && {_id: value}
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


// const getSession = ({id}, user) => {
//   return getSession(user, null, {_id: id}, [])
// }

const getSessionAction = async ({id}, user) => {
  console.log('getSession receives', id, user)
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
  await Progress.findOneAndUpdate(
    {user, block: value},
    {user, block: value, achievement_status: BLOCK_STATUS_FINISHED},
    {upsert: true, new: true}
  )
  await onBlockFinished(user._id, value)
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
    // const block = await Block.findById(dataId, {resource_type: 1, max_attempts: 1})
    //if(block.max_attempts && block.resource_type == RESOURCE_TYPE_SCORM) {
    //   const progress = await Progress.findOne({block: dataId, user}, {attempts_count: 1})
    //   if (progress.attempts_count >= block.max_attempts) {
    //     throw new ForbiddenError(`Vous avez atteint le nombre limite de tentatives`)
    //   }
    //}
    const allowed=await actionFn({action, dataId, user})
    if (!allowed) {
      throw new BadRequestError(`Action ${action} interdite`)
    }
  }
  if (action=='next') {
    await getNextResource(dataId, user)
  }
  if (action=='previous') {
    await getPreviousResource(dataId, user)
  }
  return true
}

setAllowActionFn(isActionAllowed)

module.exports={
  // Exported for programs import
  addChildAction
}
