const lodash = require("lodash");
const NodeCache=require('node-cache')
const mongoose=require('mongoose')
const Progress = require("../../models/Progress")
const { BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE, ACHIEVEMENT_RULE_CHECK } = require("./consts");
const { getBlockResources } = require("./resources");
const { idEqual } = require("../../utils/database");
const Block = require("../../models/Block");

const NAMES_CACHE=new NodeCache()

const LINKED_ATTRIBUTES_CONVERSION={
  name: (v,id) => { if (v) {return v}; throw new Error ( `${id} Name is mandatory`)},
  closed: v => v || false,
  masked: v => v || false,
  description: lodash.identity,
  picture: lodash.identity, 
  optional : v => v || false, 
  code: lodash.identity, 
  access_condition: v => v || false, 
  resource_type: lodash.identity,
  homework_mode: lodash.identity,
  url: lodash.identity,
  evaluation: v => v || false,
  achievement_rule : lodash.identity
}

const LINKED_ATTRIBUTES=Object.keys(LINKED_ATTRIBUTES_CONVERSION)

const NULLED_ATTRIBUTES=Object.fromEntries(LINKED_ATTRIBUTES.map(att => ([att, undefined])))

const setParentSession = async (session_id) => {
  const allBlocks=await getSessionBlocks(session_id)
  return mongoose.models.block.updateMany({_id: {$in: allBlocks}}, {session: session_id})
}

const getSessionBlocks = async block => {
  if (!(block instanceof mongoose.Model)) {
    throw new Error(`Expecting mongoose object`)
  }
  const res=[block]
  if (block.children===undefined) {
    await block.populate('children').execPopulate()
  }
  const subChildren=await Promise.all(block.children.map(child => getSessionBlocks(child)))
  res.push(...lodash.flatten(subChildren))
  return res
}

const getParentBlocks = async blockId => {
  const res=[]
  let block=await mongoose.models.block.findById(blockId, {parent:1})
  console.log('block', blockId)
  while (block.parent) {
    res.push(block.parent._id)
    block=await mongoose.models.block.findById(block.parent, {parent:1})
  }
  return res
}

const getBlockStatus = async (userId, params, data) => {
  return (await Progress.findOne({ block: data._id, user: userId }))?.achievement_status
}

const getBlockName = async (blockId) => {
  let result = NAMES_CACHE.get(blockId.toString())
  if (!result) {
    const block = await mongoose.models.block.findById(blockId, { name: 1, type: 1 })
    result = `${block.type}-${block.name} ${blockId}`
    NAMES_CACHE.set(blockId.toString(), result)
  }
  return result
}

const cloneTree = async (blockId, parentId) => {
  if (!blockId || !parentId) {
    throw new Error(`childId and parentId are expected`)
  }
  const parent=await mongoose.models.block.findById(parentId).populate('children_count')
  const newOrder=parent.children_count+1
  const block=await mongoose.models.block.findById(blockId).populate('children')
  let blockData={
    order: newOrder,
    ...lodash.omit(block.toObject(), [...LINKED_ATTRIBUTES, 'id', '_id', 'origin', 'parent']),
    id: undefined, _id: undefined, origin: blockId, parent: parentId,
    ...NULLED_ATTRIBUTES,
  }
  const newBlock=new mongoose.models.block({...blockData})
  await newBlock.save()
  let children=await Promise.all(block.children.map(childId => cloneTree(childId._id, newBlock._id)))
  newBlock.children=children.map(c => c._id)
  return newBlock.save()
}

const ATTRIBUTES_CACHE=new NodeCache({stdTTL: 20})

// Gets attribute from this data, else from its origin
const getAttribute = attName => async (userId, params, data) => {
  if (data.constructor.name!='model') {
    throw new Error(`Expecting mongoose object:`, JSON.stringify(data))
  }
  if (!!data._locked && data.type!='resource' && !!data[attName]) {
    return data[attName]
  }
  const key=`${data._id}/${attName}`
  if (ATTRIBUTES_CACHE.has(key)) {
    return ATTRIBUTES_CACHE.get(key)
  }
  if (!data) {
    ATTRIBUTES_CACHE.set(key, null)
    return null
  }
  if (!lodash.isNil(data[attName])) {
    ATTRIBUTES_CACHE.set(key, data[attName])
    return data[attName]
  }

  if (data.origin?.constructor.name != 'model') {
    await data.populate('origin').execPopulate()
  }

  if (data.origin) {
    const res=await getAttribute(attName)(userId, params, data.origin)
    ATTRIBUTES_CACHE.set(key, res)
    return res
  }
  ATTRIBUTES_CACHE.set(key, null)
  return null
}

const isFinished = async (user, blockId) => {
  return Progress.exists({user, block: blockId, achievement_status: BLOCK_STATUS_FINISHED})
}

const onBlockFinished = async (user, blockId) => {
  const block=await mongoose.models.block.findById(blockId)
  if (!block.parent) {
    return
  }

  const parentBlock = await mongoose.models.block.findById(block.parent).populate('children')
  const allChildrenFinished = (await Promise.all(parentBlock.children.map(c => isFinished(user, c._id)))).every(v => !!v)
  console.log('all childrenfinished', allChildrenFinished)

  if (allChildrenFinished) {
    await Progress.findOneAndUpdate(
      {block: parentBlock._id, user},
      {block: parentBlock._id, user, achievement_status: BLOCK_STATUS_FINISHED},
      {upsert: true}
    )
    await onBlockFinished(user, parentBlock._id)
  }
}

// Set all parents to current
const onBlockCurrent = async (user, blockId) => {
  const parent=(await mongoose.models.block.findById(blockId, {parent:1}))?.parent
  if (parent) {
    await Progress.findOneAndUpdate(
      {block: parent._id, user},
      {block: parent._id, user, achievement_status: BLOCK_STATUS_CURRENT},
      {upsert: true}
    )    
    return onBlockCurrent(user, parent._id)
  }
}

const onBlockAction = async (user, blockId) => {
  const progress=await Progress.findOne({user, block: blockId})
  const rule=await getAttribute('achievement_rule')(user._id, null, await mongoose.models.block.findById(blockId))
  console.log('rule is', rule)
  const finished=ACHIEVEMENT_RULE_CHECK[rule](progress)
  const status=finished ? BLOCK_STATUS_FINISHED : BLOCK_STATUS_CURRENT
  await Progress.findOneAndUpdate(
    {block: blockId, user},
    {block: blockId, user, achievement_status: status},
    {upsert: true}
  )
  if (finished) {
    console.log(`Block ${blockId} finished`)
    onBlockFinished(user, blockId)
  }
  else {
    console.log(`Block ${blockId} becomes current`)
    onBlockCurrent(user, blockId)
  }
}

// Return the session for this block
const getBlockSession = async blockId => {
  const block=await mongoose.models.block.findById(blockId, {type:1, parent:1})
  if (block.type=='session') {
    return block._id
  }
  if (!block.parent) {
    throw new Error(`${blockId}: no session found and no parent`)
  }
  return getBlockSession(block.parent)
}

const getNextResource= async (blockId, user) => {
  const session=await getBlockSession(blockId)
  const resources=await getBlockResources(session)
  const brothers=lodash.dropWhile(resources, id => !idEqual(id, blockId)).slice(1)
  if (!brothers[0]) {
    throw new Error('Pas de ressource suivante')
  }
  return {_id: brothers[0]}
}

const getPreviousResource= async (blockId, user) => {
  const session=await getBlockSession(blockId)
  let resources=await getBlockResources(session)
  resources.reverse()
  const brothers=lodash.dropWhile(resources, id => !idEqual(id, blockId)).slice(1)
  if (!brothers[0]) {
    throw new Error('Pas de ressource précédente')
  }
  return {_id: brothers[0]}
}

module.exports={
  getBlockStatus, getBlockName, getSessionBlocks, setParentSession, 
  cloneTree, getAttribute, LINKED_ATTRIBUTES, onBlockFinished, onBlockCurrent, onBlockAction,
  getNextResource, getPreviousResource, getParentBlocks,LINKED_ATTRIBUTES_CONVERSION,
}

