const mongoose=require('mongoose')
const { swapArray } = require('../../../utils/functions')
const Block = require('../../models/Block')
const Duration = require('../../models/Duration')
const Resource = require('../../models/Resource')
const { getModel, idEqual } = require('../../utils/database')
const { ForbiddenError, NotFoundError, BadRequestError } = require('../../utils/errors')
const {addAction}=require('../../utils/studio/actions')
const { BLOCK_TYPE, ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLES, BLOCK_STATUS_FINISHED, BLOCK_STATUS_CURRENT, BLOCK_STATUS_TO_COME } = require('./consts')
const { getAncestors } = require('./functions')

const ACCEPTS={
  session: ['program'],
  program: ['module', 'sequence'],
  module: ['sequence', 'resource'],
  sequence: ['resource'],
}

const acceptsChild= (pType, cType) => {
  return ACCEPTS[pType]?.includes(cType)
}

const moveChildInParent= (parentId, childId, up) => {
  return Block.findById(parentId)
    .then(parent => {
      if (!parent) { throw new NotFoundError(`Parent introuvable`)}
      const children=parent.children.map(c => c._id.toString())
      const childIdx=children.indexOf(childId)
      if (childIdx==-1) { throw new NotFoundError(`Enfant introuvable`)}
      if (up && childIdx==0) { throw new BadRequestError(`Déjà premier de la liste`)}
      if (!up && childIdx==children.length-1) { throw new BadRequestError(`Déjà dernier de la liste`)}
      const otherIdx=up ? childIdx-1 : childIdx+1
      const newChildren=swapArray(children, childIdx, otherIdx)
      return Block.findByIdAndUpdate(parentId, {children: newChildren})
    })
}

const addChildAction = ({parent, child}, user) => {
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  return Promise.all([parent, child].map(id => Block.findById(id, {[BLOCK_TYPE]: 1})))
    .then(([parent, child]) => {
      const [pType, cType]=[parent?.type, child?.type]
      if (!pType || !cType) { throw new Error('program/module/sequence/ressource attendu')}
      if (!acceptsChild(pType, cType)) { throw new Error(`${cType} ne peut être ajouté à ${pType}`)}
      return mongoose.model(cType).create({origin: child._id, creator: user})
    })
    .then(linkedChild => Block.findByIdAndUpdate(parent, {$addToSet: {actual_children: linkedChild}}))
}
addAction('addChild', addChildAction)

const removeChildAction = ({parent, child}, user) => {
  if (user.role!=ROLE_CONCEPTEUR) {
    throw new ForbiddenError(`Forbidden for role ${ROLES[user.role]}`)
  }
  return Promise.all([Block.findById(parent),Block.findById(child)])
    .then(([parentObj, childObj]) => {
      if (!parentObj) { throw new NotFoundError(`Can not find parent ${parent}`)}
      if (!childObj) { throw new NotFoundError(`Can not find child ${pchild}`)}
      if (!parentObj.children.find(v => idEqual(v._id, child))) { throw new BadRequestError(`Parent ${parent} has not child ${child}`)}
      return Promise.all([Block.deleteOne({_id: child}), Block.updateOne({_id: parent}, {$pull: {actual_children: child}})])
    })
}
addAction('removeChild', removeChildAction)

const levelUpAction = ({parent, child}, user) => {
  return moveChildInParent(parent, child, true)
}
addAction('levelUp', levelUpAction)

const levelDownAction = ({parent, child}, user) => {
  return moveChildInParent(parent, child, false)
}
addAction('levelDown', levelDownAction)

const upsertFinished = (id, user) => {
  return Promise.all([Duration.findOne({user, block:id}), Block.findById(id)])
    .then(([duration, block]) => {
      const status=duration?.finished? BLOCK_STATUS_FINISHED : duration.duration>0 ? BLOCK_STATUS_CURRENT : BLOCK_STATUS_TO_COME
      return Promise.all([
        Duration.findOneAndUpdate({user, block:id}, {finished: duration?.duration>=block?.duration}),
        Block.findByIdAndUpdate(id, status)
      ])
      
  })
}

const addSpentTimeAction = async ({id, duration}, user) => {
  const allHierarchy=await getAncestors(id)
  return Promise.all(allHierarchy.map(id => Duration.findOneAndUpdate(
    {block: id, user},
    {$inc: {duration: duration/1000}},
    {upsert: true, new: true}
  )))
  .then(() => Promise.all(allHierarchy.map(pId => upsertFinished(pId, user))))
}
addAction('addSpentTime', addSpentTimeAction)

const isActionAllowed = ({ action, dataId, user }) => {
  if (action=='addChild') {
    if (![ROLE_CONCEPTEUR, ROLE_FORMATEUR].includes(user?.role)) { throw new ForbiddenError(`Action non autorisée`)}
  }
  return Promise.resolve(true)
}