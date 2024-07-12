const path = require('path')
const Block = require("../../models/Block")
const Duration = require("../../models/Duration")
const Homework = require("../../models/Homework")
const { idEqual } = require("../../utils/database")
const { getBlockName, updateBlockStatus } = require("./block")
const { RESOURCE_TYPE_EXT, AVAILABLE_ACHIEVEMENT_RULES } = require('./consts')

const getUserHomeworks = async (userId, params, data) => {
  return Homework.find({user: userId, resource: data._id})
}

const getFinishedResources = (userId, params, data) => {
  return Duration.findOne({ block: data._id, user: userId }, { finished_resources_count: 1 })
    .then(duration => duration?.finished_resources_count || 0)
}

const getResourcesProgress = async (userId, params, data) => {
  return Duration.findOne({ block: data._id, user: userId }, { progress: 1 })
    .then(duration => duration?.progress || 0)
}

const getResourceAnnotation = (userId, params, data) => {
  return Duration.findOne({ user: userId, block: data._id })
    .then(duration => duration?.annotation)
}

const setResourceAnnotation = ({ id, attribute, value, user }) => {
  return Duration.updateOne({ user: user, block: id }, { annotation: value })
}

const isResourceMine = (userId, params, data) => {
  return Promise.resolve(idEqual(userId, data.creator._id))
}

const onSpentTimeChanged = async ({ blockId, user }) => {
  const block = await Block.findById(blockId, { session: 1 })
  const msg = `Update session time/status for ${await getBlockName(blockId)}`
  const res = await updateBlockStatus({ blockId: block.session[0]._id, userId: user._id })
  return res
}

const getResourceType = async url => {
  const extension=path.extname(url)
  const res=Object.entries(RESOURCE_TYPE_EXT).find(([type, extensions]) => extensions.includes(extension))
  if (!res) {
    throw new Error(`Type de ressource inconnu`)
  }
  return res[0]
}

const getAchievementRules = async (userId, params, data) => {
  return AVAILABLE_ACHIEVEMENT_RULES[data.resource_type]
}

module.exports={
  getFinishedResources, isResourceMine, setResourceAnnotation, getResourceAnnotation, getResourcesProgress, getUserHomeworks, onSpentTimeChanged,
  getResourceType, getAchievementRules,
}