const PermissionGroup = require('../../models/PermissionGroup')
const Progress = require('../../models/Progress')
const Resource = require('../../models/Resource')
const { loadFromDb } = require('../../utils/database')
const { BLOCK_STATUS_CURRENT } = require('./consts')
const moment = require('moment')

const getTraineeCurrentResources = async (userId, params, data, fields) => {
  // Find curent blocks for this user
  let userCurrentBlockIds=await Progress.find({user: userId, achievement_status: BLOCK_STATUS_CURRENT})
  userCurrentBlockIds=userCurrentBlockIds.map(p => p.block._id)
  let resources = await loadFromDb({
    model: 'resource', fields, params: {'filter._id': {$in: userCurrentBlockIds}}, user: userId,
  })
  return resources.map(r => new Resource(r))
}

const getUserPermissions = async (userId, params, data) => {
  return data.permission_groups.flatMap(group => group.permissions)
}

const getUserCanUploadHomework = async (userId, params, data) => {
  if (data.homework_mode == false) {
    return false
  }
  if (data.max_attempts) {
    const progress = await Progress.findOne({ block: data._id, user: userId })
    if (progress && progress.attempts_count >= data.max_attempts) {
      return false
    }
  }
  if (data.homework_limit_date) {
    if (moment().isAfter(moment(data.homework_limit_date))) {
      return false
    }
  }
  return true
}

module.exports = {
  getTraineeCurrentResources,getTraineeCurrentResources, getUserPermissions, getUserCanUploadHomework
}