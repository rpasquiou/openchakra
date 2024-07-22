const lodash = require("lodash");
const NodeCache=require('node-cache')
const mongoose=require('mongoose')
const Progress = require("../../models/Progress")
const { BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE } = require("./consts");

const NAMES_CACHE=new NodeCache()

const LINKED_ATTRIBUTES=['name', 'closed', 'description', 'picture', 'optional', 'code', 'access_condition', 
'resource_type', 'homework_mode', 'url', 'evaluation', 'achievement_rule']

const NULLED_ATTRIBUTES=Object.fromEntries(LINKED_ATTRIBUTES.map(att => ([att, undefined])))

const setParentSession = async (session_id) => {
  const allBlocks=await getSessionBlocks(session_id)
  return mongoose.models.block.updateMany({_id: {$in: allBlocks}}, {session: session_id})
}

const getSessionBlocks = async session_id => {
  const parents = await mongoose.models.block.find({$or: [{origin: session_id}, {actual_children: session_id}]}, {_id:1})
  if (lodash.isEmpty(parents)) {
    return []
  }
  return Promise.all(parents.map(p => getSessionBlocks(p._id)))
    .then(res => lodash.flattenDeep(res))
    .then(res => res.filter(v => !!v))
  return result
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
  const key=`${data._id}/${attName}`
  if (ATTRIBUTES_CACHE.has(key)) {
    return ATTRIBUTES_CACHE.get(key)
  }
  data=await mongoose.models.block.findById(data._id)
  if (!data) {
    ATTRIBUTES_CACHE.set(key, null)
    return null
  }
  if (!lodash.isNil(data[attName])) {
    ATTRIBUTES_CACHE.set(key, data[attName])
    return data[attName]
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
  const parent=(await mongoose.models.block.findById(blockId, {parent:1})).parent
  if (parent) {
    await Progress.findOneAndUpdate(
      {block: parent._id, user},
      {block: parent._id, user, achievement_status: BLOCK_STATUS_CURRENT},
      {upsert: true}
    )    
    return onBlockCurrent(user, parent._id)
  }
}


module.exports={
  getBlockStatus, getBlockName, getSessionBlocks, setParentSession, 
  cloneTree, getAttribute, LINKED_ATTRIBUTES, onBlockFinished, onBlockCurrent,
}

