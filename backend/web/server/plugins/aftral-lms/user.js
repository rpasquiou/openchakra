const Progress = require('../../models/Progress')
const Resource = require('../../models/Resource')
const { loadFromDb } = require('../../utils/database')
const { BLOCK_STATUS_CURRENT } = require('./consts')

const getTraineeCurrentResources = async (userId, params, data, fields) => {
  // Find curent blocks for this user
  let userCurrentBlockIds=await Progress.find({user: userId, achievement_status: BLOCK_STATUS_CURRENT})
  userCurrentBlockIds=userCurrentBlockIds.map(p => p.block._id)
  let resources = await loadFromDb({
    model: 'resource', fields, params: {'filter._id': {$in: userCurrentBlockIds}}
  })
  return resources.map(r => new Resource(r))
}


module.exports = {
  getTraineeCurrentResources,getTraineeCurrentResources
}