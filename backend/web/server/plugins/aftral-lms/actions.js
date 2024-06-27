const mongoose=require('mongoose')
const { swapArray } = require('../../../utils/functions')
const Block = require('../../models/Block')
const Duration = require('../../models/Duration')
const Resource = require('../../models/Resource')
const { idEqual } = require('../../utils/database')
const { ForbiddenError, NotFoundError, BadRequestError } = require('../../utils/errors')
const {addAction, setAllowActionFn}=require('../../utils/studio/actions')
const { BLOCK_TYPE, ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLES, BLOCK_STATUS_FINISHED, BLOCK_STATUS_CURRENT, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE } = require('./consts')
const { cloneTree } = require('./block')

const ACCEPTS={
  session: ['program'],
  program: ['module', 'sequence'],
  module: ['sequence', 'resource'],
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
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  [parent, child] = await Promise.all([parent, child].map(id => Block.findById(id, {[BLOCK_TYPE]: 1})))
  const [pType, cType]=[parent?.type, child?.type]
  if (!pType || !cType) { throw new Error('program/module/sequence/ressource attendu')}
  if (!acceptsChild(pType, cType)) { throw new Error(`${cType} ne peut être ajouté à ${pType}`)}
  const createdChild = await cloneTree(child._id, parent._id)
  await Block.findByIdAndUpdate(parent, {$addToSet: {children: createdChild}})
  const parentsOrigin=await Block.find({origin: parent._id})
  await Promise.all(parentsOrigin.map(parentOrigin => addChildAction({parent: parentOrigin._id, child: createdChild._id}, user)))
}
addAction('addChild', addChildAction)

const removeChildAction = async ({parent, child}, user) => {
  console.log('removing', child, 'from', parent)
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  await Block.findByIdAndDelete(child)
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
  const block=await Block.findById(id, {_locked:1})
  if (!block._locked) {
    throw new ForbiddenError(`addSpentTime forbidden on models/templates`)
  }
  const durationDoc=await Duration.findOne({block, user})
  if (durationDoc.status==BLOCK_STATUS_UNAVAILABLE) {
    throw new ForbiddenError(`addSpentTime forbidden on unavailable resource`)
  }
  durationDoc.duration+=duration/1000
  await durationDoc.save()
  console.log('Duration block is', durationDoc)
  return onSpentTimeChanged({blockId: id, user})
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

const isActionAllowed = async ({ action, dataId, user }) => {
  if (action=='addChild') {
    if (![ROLE_CONCEPTEUR, ROLE_FORMATEUR].includes(user?.role)) { throw new ForbiddenError(`Action non autorisée`)}
  }
  if (['play', 'resume', 'replay'].includes(action)) {
    const block=await Block.findOne({_id: dataId, type: 'resource'})
    if (!block) { 
      throw new NotFoundError(`Ressource introuvable`)
    }
    const parent=await Block.findOne({actual_achildren: dataId})
    const duration=await Duration.findOne({block: dataId, user})
    if (action=='play' && duration?.status!=BLOCK_STATUS_TO_COME) {
      throw new NotFoundError(`Cette ressource ne peut être jouée`)
    }
    if (action=='resume' && duration?.status!=BLOCK_STATUS_CURRENT) {
      throw new NotFoundError(`Cette ressource ne peut être jouée`)
    }
    if (action=='replay' && duration?.status!=BLOCK_STATUS_FINISHED && !parent?.closed) {
      throw new NotFoundError(`Cette ressource ne peut être rejouée`)
    }
  }
  return true
}

setAllowActionFn(isActionAllowed)