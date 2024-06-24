const lodash = require("lodash");
const NodeCache=require('node-cache')
const Block = require("../../models/Block");
const Duration = require("../../models/Duration");
const { BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE } = require("./consts");
const { getSessionBlocks, computeBlocksCount } = require('./functions');

const NAMES_CACHE=new NodeCache()

const getBlockStatus = async (userId, params, data) => {
  return Duration.findOne({ block: data._id, user: userId }, { status: 1 })
    .then(duration => duration?.status || null);
};

const getBlockName = async (blockId) => {
  let result = NAMES_CACHE.get(blockId.toString())
  if (!result) {
    const block = await Block.findById(blockId, { name: 1, type: 1 })
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
  const block = await Block.findById(blockId)
  let durationDoc = await Duration.findOne({ user: userId, block: blockId })
  const hasToCompute = !!durationDoc
  if (!durationDoc) {
    const parent = await Block.findOne({ actual_children: blockId })
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
const onBlockCountChange = async (blockId) => {
  const topLevels = await getSessionBlocks(blockId)
  console.log(`top levels are`, topLevels)
  await Promise.all(topLevels.map(p => computeBlocksCount(p._id)))
  return blockId
}
module.exports={
  onBlockCountChange, getBlockStatus, getBlockName, updateBlockStatus,
}

