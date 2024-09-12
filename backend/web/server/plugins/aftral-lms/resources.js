const mongoose = require('mongoose')
const path = require('path')
const lodash=require('lodash')
const Homework = require("../../models/Homework")
const { idEqual } = require("../../utils/database")
const { RESOURCE_TYPE_EXT, BLOCK_STATUS, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED } = require('./consts')
const Progress = require('../../models/Progress')
const { formatDuration } = require('../../../utils/text')
const Block = require('../../models/Block')

const getBlockResources = async blockId => {
  const pipeline = [
    { $match: { parent: blockId } },
    {
      $graphLookup: {
        from: 'blocks',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants'
      }
    },
    { $unwind: '$descendants' },
    { $match: { 'descendants.type': 'resource' } },
    { $project: { 'descendants._id': 1 } }
  ]

  const result = await Block.aggregate(pipeline)
  return result.map(doc => doc.descendants._id)
}


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

const getFinishedResourcesData = async (userId, blockId) => {
  const pipeline = [
    { $match: { _id: mongoose.Types.ObjectId(blockId) } },
    {
      $graphLookup: {
        from: 'blocks',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parent',
        as: 'descendants',
      }
    },
    {
      $addFields: {
        allBlocks: { $concatArrays: [['$_id'], '$descendants._id'] }
      }
    },
    { $unwind: '$allBlocks' },
    {
      $lookup: {
        from: 'blocks',
        localField: 'allBlocks',
        foreignField: '_id',
        as: 'blockInfo'
      }
    },
    { $unwind: '$blockInfo' },
    { $match: { 'blockInfo.type': 'resource' } },
    {
      $lookup: {
        from: 'progresses',
        let: { blockId: '$blockInfo._id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$block', '$$blockId'] },
                  { $eq: ['$user', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$achievement_status', BLOCK_STATUS_FINISHED] }
                ]
              }
            }
          }
        ],
        as: 'statusInfo'
      }
    },
    {
      $group: {
        _id: null,
        totalResources: { $sum: 1 },
        finishedResources: { $sum: { $cond: [{ $gt: [{ $size: '$statusInfo' }, 0] }, 1, 0] } }
      }
    }
  ];

  const results = await Block.aggregate(pipeline).exec();
  return results.length > 0 ? results[0] : { totalResources: 0, finishedResources: 0 };
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
  const subResourcesIds=await getBlockResources(data._id)
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

const getBlockNote = async (userId, params, data) => {
  return (await getProgress({user: userId, block: data._id}))?.note || null
}

module.exports={
  getFinishedResourcesCount, isResourceMine, setResourceAnnotation, getResourceAnnotation, getResourcesProgress, getUserHomeworks, onSpentTimeChanged,
  getResourceType, getBlockSpentTime, getBlockSpentTimeStr, getResourcesCount, canPlay, canReplay, canResume,
  getBlockResources, getBlockNote
}
