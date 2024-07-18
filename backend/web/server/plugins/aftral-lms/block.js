const lodash = require("lodash");
const NodeCache=require('node-cache')
const mongoose=require('mongoose')
const Duration = require("../../models/Duration");
const { BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE } = require("./consts");

const NAMES_CACHE=new NodeCache()

const LINKED_ATTRIBUTES=['name', 'closed', 'description', 'picture', 'optional', 'code', 'access_condition', 
'resource_type', 'homework_mode', 'homework_required']

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
  return Duration.findOne({ block: data._id, user: userId }, { status: 1 })
    .then(duration => duration?.status || null);
};

const getBlockName = async (blockId) => {
  let result = NAMES_CACHE.get(blockId.toString())
  if (!result) {
    const block = await mongoose.models.block.findById(blockId, { name: 1, type: 1 })
    result = `${block.type}-${block.name} ${blockId}`
    NAMES_CACHE.set(blockId.toString(), result)
  }
  return result
}

/** Update block status is the main function
 * It computes, for each block level:
 * - the FINISHED/CURRENT/TO_COME status
 * - the finished resources count
 * - the progress
 * Each block returns to its parent an object:
 * - duration : the time spent
 * - finished_resources_count: the number of finished resources
 */
const updateBlockStatus = async ({ blockId, userId }) => {
  const name = await getBlockName(blockId)
  const block = await mongoose.models.block.findById(blockId)
  let durationDoc = await Duration.findOne({ user: userId, block: blockId })
  const hasToCompute = !!durationDoc
  if (!durationDoc) {
    const parent = await mongoose.models.block.findOne({ actual_children: blockId })
    const parentClosed = parent ? parent.closed : false
    durationDoc = await Duration.create({ user: userId, block: blockId, duration: 0, status: parentClosed ? BLOCK_STATUS_UNAVAILABLE : BLOCK_STATUS_TO_COME })
  }
  if (hasToCompute && block.type == 'resource') {
    await durationDoc.save().catch(console.error)
    return durationDoc
  }
  const allDurations = await Promise.all(block.actual_children.map(child => updateBlockStatus({ blockId: child._id, userId })))
  if (hasToCompute) {
    durationDoc.duration = lodash(allDurations).sumBy('duration')
    durationDoc.finished_resources_count = lodash(allDurations).sumBy('finished_resources_count')
    durationDoc.progress = durationDoc.finished_resources_count / block.resources_count
    if (allDurations.every(d => d.status == BLOCK_STATUS_FINISHED)) {
      durationDoc.status = BLOCK_STATUS_FINISHED
    }
    else if (allDurations.some(d => [BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED].includes(d.status))) {
      durationDoc.status = BLOCK_STATUS_CURRENT
    }
    await durationDoc.save()
      .catch(err => console.error(name, 'finished', durationDoc.finished_resources_count, 'total', block.resources_count, 'progress NaN'))
  }
  return durationDoc
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

module.exports={
  getBlockStatus, getBlockName, updateBlockStatus, getSessionBlocks, setParentSession, 
  cloneTree, getAttribute, LINKED_ATTRIBUTES,
}

