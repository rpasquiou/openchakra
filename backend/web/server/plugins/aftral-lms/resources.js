const mongoose = require('mongoose')
const path = require('path')
const lodash=require('lodash')
const Homework = require("../../models/Homework")
const { idEqual } = require("../../utils/database")
const { RESOURCE_TYPE_EXT, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, ROLE_APPRENANT, BLOCK_TYPE_RESOURCE, RESOURCE_TYPE_SCORM } = require('./consts')
const Progress = require('../../models/Progress')
const { formatDuration } = require('../../../utils/text')
const Block = require('../../models/Block')
const User = require('../../models/User')
const { BadRequestError } = require('../../utils/errors')
const { runPromisesWithDelay } = require('../../utils/concurrency')

// HACK: use $sortArray in original when under mongo > 5.02
const getBlockResources = async ({blockId, userId, includeUnavailable, includeOptional}) => {
  if (!blockId) {
    console.error('blockId is required')
    throw new Error('blockId is required')
  }
  if (!userId) {
    console.error('userId is required')
    throw new Error('userId is required')
  }
  if (lodash.isNil(includeUnavailable)) {
    console.trace('includeUnavailable is required')
    throw new Error('includeUnavailable is required')
  }
  if (lodash.isNil(includeOptional)) {
    console.trace('includeOptional is required')
    throw new Error('includeOptional is required')
  }
  return getBlockResourcesNew({blockId, userId, includeUnavailable, includeOptional})
}

const getBlockResourcesNew = async ({ blockId, userId, includeUnavailable, includeOptional, role }) => {
  if (!role) {
    role = (await User.findById(userId))?.role;
  }

  const blocks = await Block.find({ parent: blockId, masked: { $ne: true } })
    .select({ _id: 1, type: 1, order: 1, optional: 1 })
    .sort({ order: 1 });

  let res = [];

  // Process each block, and ensure correct ordering of results
  for (const b of blocks) {
    if (!!b.optional && !includeOptional) {
      continue
    }
    if (b.type == BLOCK_TYPE_RESOURCE) {
      if (role == ROLE_APPRENANT && !includeUnavailable) {
        const available = await Progress.exists({
          block: b._id,
          user: userId,
          achievement_status: { $in: [BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED] }
        });
        if (!available) {
          continue
        }
      }
      res.push(b)
    } else {
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
  return Progress.findOne({user, block})
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

const getFinishedResourcesCount = async (userId, params, data) => {
  const { finishedResources } = await getFinishedResourcesData(userId, data._id)
  return finishedResources
}

const getResourcesProgress = async (userId, params, data) => {
  const { finishedResources, totalResources } = await getFinishedResourcesData(userId, data._id)
  return totalResources > 0 ? finishedResources / totalResources : 0
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

const getResourcesCount = async (userId, params, data) => {
  const subResourcesIds=await getBlockResources({blockId: data._id, userId, includeUnavailable: true, includeOptional: true})
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
  getFinishedResourcesCount, isResourceMine, setResourceAnnotation, getResourceAnnotation, getResourcesProgress, getUserHomeworks, onSpentTimeChanged,
  getResourceType, getBlockSpentTime, getBlockSpentTimeStr, getResourcesCount, canPlay, canReplay, canResume,
  getBlockResources, getBlockChildren,
}
