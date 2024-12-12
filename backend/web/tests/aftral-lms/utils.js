const Block = require("../../server/models/Block")
const { getBlockStatus } = require("../../server/plugins/aftral-lms/block")
const { BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT } = require("../../server/plugins/aftral-lms/consts")
const { getBlockResources } = require("../../server/plugins/aftral-lms/resources")

const getFirstAvailableResource = async (sessionId, traineeId) => {
  let resources=await getBlockResources({blockId: sessionId, userId: traineeId, includeUnavailable: false, includeOptional: true})
  resources=await Promise.all(resources.map(r => Block.findById(r)))
  const statuses=await Promise.all(resources.map(r => getBlockStatus(traineeId, {}, {_id: r._id})))
  let idx=statuses.indexOf(BLOCK_STATUS_TO_COME)
  if (idx==-1) {
    idx=statuses.indexOf(BLOCK_STATUS_CURRENT)
  }
  if (idx==-1) {
    throw new Error(`No more resources`)
  }
  const nextResource=resources[idx]
  return nextResource
}

module.exports={
  getFirstAvailableResource,
}