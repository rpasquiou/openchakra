const mongoose = require('mongoose')
const path = require('path')
const lodash=require('lodash')
const Homework = require("../../models/Homework")
const { idEqual } = require("../../utils/database")
const { RESOURCE_TYPE_EXT, BLOCK_STATUS, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, ROLE_APPRENANT } = require('./consts')
const Progress = require('../../models/Progress')
const { formatDuration } = require('../../../utils/text')
const Block = require('../../models/Block')
const User = require('../../models/User')
const { BadRequestError } = require('../../utils/errors')

// TODO: For trainees only : don't count masked blocks (i.e block.masked==true)
const getBlockResources = async (blockId, userId) => {
  if (!userId) {
    return console.trace(`User is null`)
  }
  const resourceFilter={ 'descendants.type': 'resource'}
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
  const subResourcesIds=await getBlockResources(data._id, userId)
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
  const isTrainee=await User.exists({_id: userId, role: ROLE_APPRENANT})
  if (!isTrainee) {
    return undefined
  }
  if (!!data.homework_mode) {
    const homeworks=await Homework.find({resource: data._id, trainee: userId})
    const note=lodash.max(homeworks.map(h => h.note))
    return note
  }
  else {
    return (await getProgress({user: userId, block: data._id}))?.note || null
  }
}

const setBlockNote = async ({ id, attribute, value, user }) => {
  const bl=await Block.findById(id)
  if (!lodash.inRange(value, 0, bl.success_note_max+1)) {
    throw new BadRequestError(`La note doit être comprise ente 0 et ${bl.success_note_max}`)
  }
  if (!!bl.homework_mode) {
    throw new BadRequestError(`La note doit être mise sur un devoir`)
  }
  pr = await getProgress({user, id})
  pr.note=value
  return pr.save()
}

module.exports={
  getFinishedResourcesCount, isResourceMine, setResourceAnnotation, getResourceAnnotation, getResourcesProgress, getUserHomeworks, onSpentTimeChanged,
  getResourceType, getBlockSpentTime, getBlockSpentTimeStr, getResourcesCount, canPlay, canReplay, canResume,
  getBlockResources, getBlockNote, setBlockNote,
}
