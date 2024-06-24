const Block = require('../../models/Block')
const lodash=require('lodash')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const {
  declareVirtualField, setPreCreateData, setPreprocessGet, setMaxPopulateDepth, setFilterDataUser, declareComputedField, declareEnumField, idEqual, getModel, declareFieldDependencies,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES, MAX_POPULATE_DEPTH, BLOCK_STATUS, ROLE_CONCEPTEUR, ROLE_FORMATEUR, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_TO_COME, BLOCK_STATUS_UNAVAILABLE, ROLE_APPRENANT, FEED_TYPE_GENERAL, FEED_TYPE_SESSION, FEED_TYPE_GROUP, FEED_TYPE, ACHIEVEMENT_RULE } = require('./consts')
const cron=require('node-cron')
const Duration = require('../../models/Duration')
const { formatDuration } = require('../../../utils/text')
const mongoose = require('mongoose')
const Resource = require('../../models/Resource')
const Session = require('../../models/Session')
const { BadRequestError } = require('../../utils/errors')
const NodeCache=require('node-cache')
const Message = require('../../models/Message')
const { CREATED_AT_ATTRIBUTE, PURCHASE_STATUS } = require('../../../utils/consts')
const User = require('../../models/User')
const Post = require('../../models/Post')
require('../../models/Module')
require('../../models/Sequence')
require('../../models/Search')
const { computeStatistics } = require('./statistics')
const { searchUsers, searchBlocks } = require('./search')
const { getUserHomeworks } = require('./resources')
const ObjectId = mongoose.Types.ObjectId

const NAMES_CACHE=new NodeCache()

const GENERAL_FEED_ID='FFFFFFFFFFFFFFFFFFFFFFFF'

const getBlockName = async blockId => {
  let result=NAMES_CACHE.get(blockId.toString())
  if (!result) {
    const block=await Block.findById(blockId, {name:1, type:1})
    result=`${block.type}-${block.name} ${blockId}`
    NAMES_CACHE.set(blockId.toString(), result)
  }
  return result
}

const getFinishedResources = (userId, params, data) => {
  return Duration.findOne({block: data._id, user: userId}, {finished_resources_count:1})
    .then(duration => duration?.finished_resources_count || 0)
}

const getResourcesProgress = async (userId, params, data) => {
  return Duration.findOne({block: data._id, user: userId}, {progress:1})
    .then(duration => duration?.progress || 0)
}

setMaxPopulateDepth(MAX_POPULATE_DEPTH)

const getBlockStatus = async (userId, params, data) => {
  return Duration.findOne({block: data._id, user: userId}, {status:1})
    .then(duration => duration?.status || null)
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
const updateBlockStatus = async ({blockId, userId}) => {
  const name=await getBlockName(blockId)
  const block=await Block.findById(blockId)
  let durationDoc=await Duration.findOne({user: userId, block: blockId})
  const hasToCompute=!!durationDoc
  if (!durationDoc) {
    const parent=await Block.findOne({actual_children: blockId})
    const parentClosed=parent ? parent.closed : false
    durationDoc= await Duration.create({user: userId, block: blockId, duration: 0, status: parentClosed ? BLOCK_STATUS_UNAVAILABLE : BLOCK_STATUS_TO_COME})
  }
  if (hasToCompute && block.type=='resource') {
    await durationDoc.save().catch(console.error)
    return durationDoc
  }
  const allDurations=await Promise.all(block.actual_children.map(child => updateBlockStatus({blockId: child._id, userId})))
  if (hasToCompute) {
    durationDoc.duration=lodash(allDurations).sumBy('duration')
    durationDoc.finished_resources_count=lodash(allDurations).sumBy('finished_resources_count')
    durationDoc.progress=durationDoc.finished_resources_count/block.resources_count
    if (allDurations.every(d => d.status==BLOCK_STATUS_FINISHED)) {
      durationDoc.status=BLOCK_STATUS_FINISHED
    }
    else if (allDurations.some(d => [BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED].includes(d.status))) {
      durationDoc.status=BLOCK_STATUS_CURRENT
    }
    await durationDoc.save()
      .catch(err =>  console.error(name, 'finished', durationDoc.finished_resources_count, 'total', block.resources_count, 'progress NaN'))
  }
  return durationDoc
}

const onSpentTimeChanged = async ({blockId, user}) => {
  const block=await Block.findById(blockId, {session:1})
  const msg=`Update session time/status for ${await getBlockName(blockId)}`
  const res=await updateBlockStatus({blockId: block.session[0]._id, userId: user._id})
  return res
}

const onBlockCountChange = async blockId => {
  const topLevels=await getSessionBlocks(blockId)
  console.log(`top levels are`, topLevels)
  await Promise.all(topLevels.map(p => computeBlocksCount(p._id)))
  return blockId
}

const getResourceAnnotation = (userId, params, data) => {
  return Duration.findOne({user: userId, block: data._id})
    .then(duration => duration?.annotation)
}

const setResourceAnnotation = ({id, attribute, value, user}) => {
  return Duration.updateOne({user: user, block: id}, {annotation: value})
}

const isResourceMine = (userId, params, data) => {
  return Promise.resolve(idEqual(userId, data.creator._id))
}
  
const MODELS=['block', 'program', 'module', 'sequence', 'resource', 'session']

MODELS.forEach(model => {
  declareFieldDependencies({model, field: 'name', requires: 'origin.name'})
  declareFieldDependencies({model, field: 'url', requires: 'origin.url'})
  declareVirtualField({model, field: 'order', instance: 'Number'})
  declareVirtualField({model, field: 'children_count', instance: 'Number', requires: 'children,actual_children,origin.children,origin.actual_children'})
  declareFieldDependencies({model, field: 'resource_type', requires: 'origin.resource_type'})
  declareEnumField({model, field: 'resource_type', enumValues: RESOURCE_TYPE})
  declareVirtualField({model, field: 'evaluation', instance: 'Boolean'})
  declareVirtualField({model, field: 'children', instance: 'Array', requires: 'actual_children.children,origin.children,origin.actual_children,actual_children.origin,children.origin',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'block'}},
  })
  declareFieldDependencies({model, field: 'origin', requires: 'origin.actual_children,origin.children'})
  declareComputedField({model, field: 'spent_time', getterFn: (userId, params, data) => {
    return Duration.findOne({user: userId, block: data._id}, {duration:1})
      .then(result => result?.duration || 0)
  }})
  declareComputedField({model, field: 'spent_time_str', getterFn: (userId, params, data) => {
    return Duration.findOne({user: userId, block: data._id}, {duration:1})
      .then(result => formatDuration(result?.duration || 0))
  }})
  declareEnumField({model, field: 'achievement_status', enumValues: BLOCK_STATUS})
  declareComputedField({model, field: 'achievement_status', getterFn: getBlockStatus})
  declareComputedField({model, field: 'finished_resources_count', getterFn: getFinishedResources})
  declareComputedField({model, field: 'resources_progress', getterFn: getResourcesProgress})
  declareComputedField({model, field: 'annotation', getterFn: getResourceAnnotation, setterFn: setResourceAnnotation})
  declareVirtualField({model, field: 'is_template', instance: 'Boolean'})
  declareVirtualField({model, field: 'search_text', instance: 'String', requires: 'code,name',
    dbFilter: value => ({$or:[{name: value}, {code: value}]}),
  })
  declareComputedField({model, field: 'homeworks', getterFn: getUserHomeworks})
})

declareVirtualField({model: 'resource', field: 'has_homework', type: 'Boolean'})
declareEnumField({model: 'resource', field: 'achievement_rule', enumValues: ACHIEVEMENT_RULE})

declareEnumField({model:'program', field: 'status', enumValues: PROGRAM_STATUS})

declareEnumField({model:'duration', field: 'status', enumValues: BLOCK_STATUS})

declareComputedField({model: 'resource', field: 'mine', getterFn: isResourceMine})

declareEnumField({model: 'feed', field: 'type', enumValues: FEED_TYPE})

declareEnumField({model: 'post', field: '_feed_type', enumValues: FEED_TYPE})

declareEnumField({model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})

const USER_MODELS=['user', 'loggedUser', 'contact']
USER_MODELS.forEach(model => {
  declareEnumField({model, field: 'role', instance: 'String', enumValues: ROLES})
})

// search start
declareComputedField({model: 'search', field: 'users', getterFn: searchUsers})
declareFieldDependencies({model: 'search', field: 'blocks', requires: 'pattern'})
declareComputedField({model: 'search', field: 'blocks', getterFn: searchBlocks})
declareFieldDependencies({model: 'search', field: 'users', requires: 'pattern'})
// search end

const preCreate = ({model, params, user}) => {
  if (['resource'].includes(model)) {
    params.creator=params?.creator || user
  }
  if ('homework'==model) {
    params.trainee=user
  }
  if (model=='post') {
    params.author=user
    const parentId=params.parent
    const modelPromise=parentId==GENERAL_FEED_ID ? Promise.resolve(FEED_TYPE_GENERAL) :  getModel(parentId, [FEED_TYPE_GROUP, FEED_TYPE_SESSION])
    return modelPromise
      .then(modelName => {
        params._feed=parentId
        params._feed_type=modelName
        return Promise.resolve({model, params})
      })
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const getContacts = user => {
  console.log('user is', user)
  if ([ROLE_APPRENANT, ROLE_FORMATEUR].includes(user.role)) {
    return Session.find({$or: [{trainers: user._id},{trainees: user._id}]})
      .populate(['trainers', 'trainees'])
      .then(sessions => sessions.map(s => [s.trainers, s.trainees]))
      .then(res => lodash.flattenDepth(res, 2))
      .then(res => res.filter(u => !idEqual(u._id, user._id)))
  }
  return User.find()
    .then(res => res.filter(u => !idEqual(u._id, user._id)))
}

const getFeed = async id => {
  let type, name
  if (id==GENERAL_FEED_ID) {
    type=FEED_TYPE_GENERAL
    name= 'Forum Aftral LMS'
  }
  else {
    const model=await getModel(id, ['session', 'group'])
    type=model=='session' ? FEED_TYPE_SESSION : FEED_TYPE_GROUP
    const feed=await mongoose.connection.models[model].findById(id)
    name=feed.name
  }
  return Post.find({_feed: id}).populate('author')
    .then(posts => {
      return ({
        _id: id,
        type,
        name,
        posts
      })
    })
}

const getFeeds = async (user, id) => {
  let ids=[]
  if (!id) {
    ids=(await Session.find({$or: [{trainers: user._id}, {trainees: user._id}]})).map(s => s._id)
    ids=[...ids, GENERAL_FEED_ID]
  }
  else {
    ids=[id]
  }
  return Promise.all(ids.map(sessId => getFeed(sessId)))
}

const preprocessGet = ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  // Add resource.creator.role to filter after
  if (model=='resource') {
    fields=[...fields, 'creator']
  }

  if (model == 'contact') {
    return getContacts(user, id)
      .then(res => {
        return Promise.resolve({data: res})
      }) 
  }

  if (model == 'feed') {
    return getFeeds(user, id)
      .then(res => {
        return Promise.resolve({data: res})
      }) 
  }

  if (model=='statistics') {
    return computeStatistics({model, fields, id, user, params})
      .then(data => ({data}))
  }
  if (model=='conversation') {
    const getPartner= (m, user) => {
      return idEqual(m.sender._id, user._id) ? m.receiver : m.sender
    }

    // Get non-group messages (i.e. no group attribute)
    return Message.find({$or: [{sender: user._id}, {receiver: user._id}]})
      .populate({path: 'sender'})
      .populate({path: 'receiver'})
      .sort({CREATED_AT_ATTRIBUTE: 1})
      .then(messages => {
        if (id) {
          messages=messages.filter(m => idEqual(getPartner(m, user)._id, id))
          // If no messages for one parner, forge it
          if (lodash.isEmpty(messages)) {
            return User.findById(id)
              .then(partner => {
                const data=[{_id: partner._id, partner, messages: []}]
                return {model, fields, id, data, params}
              })
          }
        }
        const partnerMessages=lodash.groupBy(messages, m => getPartner(m, user)._id)
        const convs=lodash(partnerMessages)
          .values()
          .map(msgs => { 
            const partner=getPartner(msgs[0], user);
            return ({_id: partner._id, partner, messages: msgs, newest_message: lodash.maxBy(messages, 'creation_date')}) 
          })
          .sortBy(CREATED_AT_ATTRIBUTE, 'asc')
          .value()
        return {model, fields, id, data: convs, params}
      })
  }

  return Promise.resolve({model, fields, id, user, params})
}

setPreprocessGet(preprocessGet)

const filterDataUser = ({model, data, id, user}) => {
  if (MODELS.includes(model) && !id) {
    data=data.filter(d => !d.origin)
    // Filter my sessions
    if (model=='session') {
      data=data.filter(d => [...(d.trainers||[]), ...(d.trainees||[])].some(v => idEqual(v._id || v, user._id)))
    }
    else if (model=='resource') {
      const resources_filter=user.role==ROLE_CONCEPTEUR ? r => (r.creator.role==ROLE_CONCEPTEUR && !r._locked)
      :
      user.role==ROLE_FORMATEUR ? r => (r.creator.role==ROLE_CONCEPTEUR || idEqual(r.creator._id, user._id)) && !r._locked
      :
      () => false
      data=data.filter(resources_filter)
    }
    else {
      if (user.role==ROLE_CONCEPTEUR) { data=data.filter(b => !b._locked)}
    }
  }
  return Promise.resolve(data)
}

setFilterDataUser(filterDataUser)

const cloneNodeData = node => {
  return lodash.omit(node.toObject(), 
    ['status', 'achievement_status', 'actual_children', 'children', '_id', 'id', 'spent_time', 'creation_date', 'update_date',
    'order', 'duration_str'
  ])
}


const cloneAndLock = blockId => {
  return Block.findById(blockId._id)
    .then(block => {
      const allChildren=[block.origin, ...block.actual_children].filter(v => !!v)
      return Promise.all(allChildren.map(c => cloneAndLock(c)))
        .then(children=> {
          if (!block.is_template) {
            return children[0]
          }
          const cloned=cloneNodeData(block)
          return mongoose.model(block.type).create({...cloned, _locked: true, actual_children: children})
            .catch(err => {
              console.error(block, cloned)
              throw err
            })
        })
    })
  }

const getSessionBlocks = async session_id => {
  const parents = await Block.find({$or: [{origin: session_id}, {actual_children: session_id}]}, {_id:1})
  if (lodash.isEmpty(parents)) {
    return []
  }
  return Promise.all(parents.map(p => getSessionBlocks(p._id)))
    .then(res => lodash.flattenDeep(res))
    .then(res => res.filter(v => !!v))
  return result
}

const setParentSession = async (session_id) => {
  const allBlocks=await getSessionBlocks(session_id)
  return Block.updateMany({_id: {$in: allBlocks}}, {session: session_id})
}

const computeBlocksCount = async blockId => {
  const block=await Block.findById(blockId).populate(['children', 'actual_chlidren', 'origin'])
  if (block.type=='resource') {
    block.resources_count=1
    await block.save()
    return 1
  }
  const name=await getBlockName(blockId)
  const childrenCount=await Promise.all(block.children.map(child => computeBlocksCount(child._id))).then(counts => lodash.sum(counts))
  block.resources_count=childrenCount
  await block.save()
  return childrenCount
}

const lockSession = async sessionId => {
  console.log('locking session', sessionId)
  const session=await Block.findById(sessionId)
  if (session._locked) {
    console.warn(`Session`, session._id, `is already locked`)
  }
  else {
    const cloned= await Promise.all(session.actual_children.map(c => cloneAndLock(c)))
    await Block.findByIdAndUpdate(session._id, {$set: {actual_children: cloned, _locked: true}})
  }
  await computeBlocksCount(session._id)
  await setParentSession(session._id)
  await Promise.all(session.trainees.map(trainee => updateBlockStatus({blockId: session._id, userId: trainee._id})))
}

module.exports={
  lockSession,
  onSpentTimeChanged,
  onBlockCountChange,
  getSessionBlocks,
  computeBlocksCount,
}