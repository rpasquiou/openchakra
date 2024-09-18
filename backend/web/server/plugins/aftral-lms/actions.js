const mongoose=require('mongoose')
const Block = require('../../models/Block')
const { ForbiddenError, NotFoundError, BadRequestError } = require('../../utils/errors')
const {addAction, setAllowActionFn}=require('../../utils/studio/actions')
const { BLOCK_TYPE, ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLES, BLOCK_STATUS_FINISHED, BLOCK_STATUS_CURRENT, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE, ROLE_ADMINISTRATEUR, RESOURCE_TYPE_SCORM, ROLE_HELPDESK } = require('./consts')
const { cloneTree, onBlockFinished, getNextResource, getPreviousResource, getParentBlocks, getSession } = require('./block')
const { lockSession } = require('./functions')
const Progress = require('../../models/Progress')
const { canPlay, canResume, canReplay } = require('./resources')
const { isProduction } = require('../../../config/config')
const User = require('../../models/User')


const ACCEPTS={
  session: ['program'],
  program: ['chapter', 'module'],
  chapter: ['module'],
  module: ['sequence'],
  sequence: ['resource'],
}

const acceptsChild= (pType, cType) => {
  return ACCEPTS[pType]?.includes(cType)
}

const moveChildInParent= async (childId, up) => {
  const delta=up ? -1 : 1
  const child=await Block.findById(childId).populate({path: 'parent', populate: 'children_count'})
  const childrenCount=child.parent.children_count
  const newOrder=child.order+delta
  if (newOrder<1) {
    throw new ForbiddenError(`Déjà en tête de liste`)
  }
  if (newOrder>=childrenCount) {
    throw new ForbiddenError(`Déjà en fin de liste`)
  }
  const brother=await Block.findOne({parent: child.parent, order: child.order+delta})
  if (!brother) {
    throw new Error('No brother')
  }
  child.order=newOrder
  brother.order=brother.order-delta
  await Promise.all([child.save(), brother.save()])
  const linkedBlocks=await Block.find({origin: childId})
  return Promise.all(linkedBlocks.map(block => moveChildInParent(block._id, up)))
}

const addChildAction = async ({parent, child}, user) => {
  // Allow ADMIN to add child for session import
  if (![ROLE_ADMINISTRATEUR, ROLE_CONCEPTEUR].includes(user.role)) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  [parent, child] = await Promise.all([parent, child].map(id => Block.findById(id, {[BLOCK_TYPE]: 1})))
  const [pType, cType]=[parent?.type, child?.type]
  if (!pType || !cType) { throw new Error('program/module/sequence/ressource attendu')}
  if (!acceptsChild(pType, cType)) { throw new Error(`${cType} ne peut être ajouté à ${pType}`)}
  const createdChild = await cloneTree(child._id, parent._id)
  await Block.findByIdAndUpdate(parent, {last_updater: user})

  // Now propagate to all origins
  const origins=await Block.find({origin: parent._id}, {_id:1})
  await Promise.all(origins.map(origin => addChildAction({parent: origin._id, child: createdChild._id}, user)))
}
addAction('addChild', addChildAction)

const removeChildAction = async ({parent, child}, user) => {
  console.log('removing', child, 'from', parent)
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  await Block.findByIdAndDelete(child)
  await Block.findByIdAndUpdate(parent, {last_updater: user})
  // Propagate deletion
  const linkedChildren=await Block.find({origin: child}).populate('parent')
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
  return Promise.all(toUpdate.map(blockId => Progress.findOneAndUpdate(
    {user, block: blockId},
    {user, block: blockId, $inc: {spent_time: duration/1000}},
    {upsert: true, new: true}
    )))
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


// const getSession = ({id}, user) => {
//   return getSession(user, null, {_id: id}, [])
// }

const getSessionAction = async ({id}, user) => {
  console.log('getSession receives', id, user)
  return getSession(user._id, null, {_id: id}, [])
}
  
addAction('session', getSessionAction)

// TODO dev only
if (!isProduction()) {
  const forceFinishResource = async ({value, dataId}, user) => {
    if([ROLE_HELPDESK, ROLE_FORMATEUR].includes(user.role) && dataId) {
      user = await User.findById(dataId)
    }
    await Progress.findOneAndUpdate(
      {user, block: value._id},
      {user, block: value._id, achievement_status: BLOCK_STATUS_FINISHED},
      {upsert: true, new: true}
    )
    await onBlockFinished(user, await Block.findById(value._id))
  }

  addAction('alle_finish_mission', forceFinishResource)
}


const isActionAllowed = async ({ action, dataId, user }) => {
  if (action=='addChild') {
    if (![ROLE_CONCEPTEUR, ROLE_FORMATEUR].includes(user?.role)) { throw new ForbiddenError(`Action non autorisée`)}
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
    return actionFn({action, dataId, user})
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