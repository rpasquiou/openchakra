const mongoose = require('mongoose')
const path = require('path')
const lodash=require('lodash')
const Homework = require("../../models/Homework")
const { idEqual } = require("../../utils/database")
const { RESOURCE_TYPE_EXT, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, ROLE_APPRENANT, BLOCK_TYPE_RESOURCE, RESOURCE_TYPE_SCORM, BLOCK_STATUS_UNAVAILABLE } = require('./consts')
const Progress = require('../../models/Progress')
const { formatDuration } = require('../../../utils/text')
const Block = require('../../models/Block')
const User = require('../../models/User')

let count=0
// HACK: use $sortArray in original when under mongo > 5.02
const getBlockResources = async ({blockId, userId, includeUnavailable, includeOptional, ordered}) => {
  if (!blockId || (!includeUnavailable && !userId) || lodash.isNil(includeUnavailable) || lodash.isNil(includeOptional)) {
    const errorMsg=`blockId, userId, includeUnavailable, includeOptionalrequired, GOT ${[blockId, userId, includeUnavailable, includeOptional]}`
    console.trace(errorMsg)
    throw new Error(errorMsg)
  }
  const res=await getBlockResourcesNew({blockId, userId, includeUnavailable, includeOptional})
  return res
}

const getBlockResourcesNew = async ({ blockId, userId, includeUnavailable, includeOptional, role }) => {
  if (!role) {
    role = (await User.findById(userId))?.role;
  }

  let query = Block.find({ parent: blockId, masked: { $ne: true } })
    .select({ _id: 1, type: 1, order: 1, optional: 1 })
    .lean({ virtuals: false })
    .sort({ order: 1 })

  // Load unavailable progress
  if (role == ROLE_APPRENANT && !includeUnavailable) {
    query=query.populate({ path: 'progresses', match: { achievement_status: BLOCK_STATUS_UNAVAILABLE, user: userId }, select: { _id: 1 } })
  }
  const blocks = await query
  let res = [];

  // Process each block, and ensure correct ordering of results
  for (const b of blocks) {
    // Don't include optionals: skip
    if (!!b.optional && !includeOptional) {
      continue
    }
    // Don't include unavailable: skip
    if (role == ROLE_APPRENANT && !includeUnavailable) {
      const unavailable = b.progresses.length>0
      if (unavailable) {
        continue
      }
    } 
    if (b.type==BLOCK_TYPE_RESOURCE) {
      res.push(b)
    }
    else {
      const subResources = await getBlockResourcesNew({
        blockId: b._id,
        userId,
        includeUnavailable,
        includeOptional,
        role
      });
      res = [...res, ...subResources]
    }
  }

  return res;
};


// TODO: For trainees only : don't count masked blocks (i.e block.masked==true)
const getBlockResourcesOriginal = async ({blockId, userId}) => {

  if (!userId) {
    return console.trace(`User is null`)
  }
  const resourceFilter={ 'descendants.type': BLOCK_TYPE_RESOURCE}
  const role=(await User.findById(userId)).role
  if (role==ROLE_APPRENANT) {
    resourceFilter['descendants.masked']={$ne: true}
  }
  const pipeline = [
    { $match: { _id: mongoose.Types.ObjectId(blockId), masked: {$ne: true }}},
    {
      $graphLookup: {
        from: 'blocks',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants'
      }
    },
    { $unwind: { path: '$descendants'} },
    { $match:  resourceFilter},
    { $project: { resourceId: '$descendants._id'} }
  ]

  const result = await Block.aggregate(pipeline)

  return result.map(doc => doc.resourceId);
};

const getProgress = async ({user, block}) => {
  return Progress.findOne({block, user})
}

const blockHasStatus = async ({user, block, status}) => {
  return Progress.exists({user, block, achievement_status: status})
}
const getBlockSpentTime = async (userId, params, data) => {
  return (await getProgress({user: userId, block: data._id}))?.spent_time || 0
}

const getBlockSpentTimeStr = async (userId, params, data) => {
  const spentTime= await getBlockSpentTime(userId, params, data)
  return formatDuration(spentTime || 0)
}

const getUserHomeworks = async (userId, params, data) => {
  return Homework.find({user: userId, resource: data._id})
}

// TODO: For trainees only : don't count masked blocks (i.e block.masked==true)
const getFinishedResourcesData = async (userId, blockId) => {
  const resources=await getBlockResources({blockId, userId, includeUnavailable: true, includeOptional: false})
  const totalResources=resources.length
  const finishedResources=await Progress.countDocuments({block: {$in: resources.map(r => r._id)}, user: userId, achievement_status: BLOCK_STATUS_FINISHED})
  return {totalResources, finishedResources}
};

// Returns MANDATORY finished resources
const getFinishedMandatoryResourcesCount = async (userId, params, data) => {
  return (await getProgress({user: userId, block: data._id}))?.finished_resources_count
}

// Mandatory resouces percent progress
const getResourcesProgress = async (userId, params, data) => {
  const mandatoryFinished=(await Progress.findOne({user: userId, block: data._id}))?.finished_resources_count
  const mandatoryTotal=data.mandatory_resources_count
  return mandatoryTotal>0 ? mandatoryFinished /mandatoryTotal : 0
}

const getResourceAnnotation = async (userId, params, data) => {
  return (await getProgress({user: userId, block: data._id}))?.annotation
}

const setResourceAnnotation = async ({ id, attribute, value, user }) => {
  return Progress.findOneAndUpdate(
    {user: user, block: id},
    {user: user, block: id, annotation: value},
    {upsert: true, new: true})
}

const isResourceMine = async (userId, params, data) => {
  return idEqual(userId, data.creator?._id)
}

const onSpentTimeChanged = async ({ blockId, user }) => {
  // TODO implement
  throw new Error('not implemented')
}

const getResourceType = async url => {
  const extension=path.extname(url)
  const res=Object.entries(RESOURCE_TYPE_EXT).find(([type, extensions]) => extensions.includes(extension))
  if (!res) {
    throw new Error(`Type de ressource inconnu`)
  }
  return res[0]
}

// All resources count, including optional
const getAllResourcesCount = async (userId, params, data) => {
  const subResourcesIds=await getBlockResources({blockId: data._id, userId, includeUnavailable: true, includeOptional: true})
  return subResourcesIds.length
}

// All resources count, including optional
const getMandatoryResourcesCount = async (userId, params, data) => {
  const subResourcesIds=await getBlockResources({blockId: data._id, userId, includeUnavailable: true, includeOptional: false})
  return subResourcesIds.length
}

const canPlay = async ({dataId, user }) => {
  return blockHasStatus({user, block: dataId, status: BLOCK_STATUS_TO_COME})
}

const canResume = async ({dataId, user }) => {
  return blockHasStatus({user, block: dataId, status: BLOCK_STATUS_CURRENT})
}

const canReplay = async ({dataId, user }) => {
  return blockHasStatus({user, block: dataId, status: BLOCK_STATUS_FINISHED})
}

const getBlockChildren = async ({blockId}) => {

  const pipeline = [
    { $match: { _id: mongoose.Types.ObjectId(blockId), masked: {$ne: true }}},
    {
      $graphLookup: {
        from: 'blocks',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants'
      }
    },
    { $unwind: { path: '$descendants'} },
    { $project: { blockId: '$descendants._id'} }
  ]

  const result = await Block.aggregate(pipeline)

  return result.map(doc => doc.blockId);
}

module.exports={
  getFinishedMandatoryResourcesCount, isResourceMine, setResourceAnnotation, getResourceAnnotation, getResourcesProgress, getUserHomeworks, onSpentTimeChanged,
  getResourceType, getBlockSpentTime, getBlockSpentTimeStr, getAllResourcesCount, canPlay, canReplay, canResume,
  getBlockResources, getBlockChildren,getMandatoryResourcesCount,getFinishedResourcesData, getProgress,
}
