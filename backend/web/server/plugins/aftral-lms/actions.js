const mongoose=require('mongoose')
const { swapArray } = require('../../../utils/functions')
const Block = require('../../models/Block')
const Duration = require('../../models/Duration')
const { getModel, idEqual } = require('../../utils/database')
const { ForbiddenError, NotFoundError, BadRequestError } = require('../../utils/errors')
const {addAction}=require('../../utils/studio/actions')
const { BLOCK_TYPE, ROLE_CONCEPTEUR, ROLE_FORMATEUR } = require('./consts')
const { getAncestors } = require('./functions')

const ACCEPTS={
  session: ['program'],
  program: ['module', 'sequence', 'resource'],
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
  return Promise.reject(`En cours d'implémentation pour les templates`)
  return Block.findById(parent)
    .then(parent => {
      if (!parent) { throw new NotFoundError(`Donnée ${parent} introuvable`)}
      return Block.findByIdAndUpdate(parent, {$pull: {children: child}})
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

const addSpentTimeAction = async ({id, duration}, user) => {
  const allHierarchy=await getAncestors(id)
  return Promise.all(allHierarchy.map(id => Duration.findOneAndUpdate(
    {block: id, user},
    {$inc: {duration: duration/1000}},
    {upsert: true, new: true}
  )))
}
addAction('addSpentTime', addSpentTimeAction)

const isActionAllowed = ({ action, dataId, user }) => {
  if (action=='addChild') {
    if (![ROLE_CONCEPTEUR, ROLE_FORMATEUR].includes(user?.role)) { throw new ForbiddenError(`Action non autorisée`)}
  }
  return Promise.resolve(true)
}