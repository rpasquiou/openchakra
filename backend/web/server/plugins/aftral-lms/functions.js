const Block = require('../../models/Block')
const lodash=require('lodash')
const {
  declareVirtualField, setPreCreateData, setPreprocessGet, setMaxPopulateDepth, setFilterDataUser, declareComputedField, declareEnumField, idEqual, getModel, declareFieldDependencies, setPostPutData, setPreDeleteData, setPrePutData, loadFromDb,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES, MAX_POPULATE_DEPTH, BLOCK_STATUS, ROLE_CONCEPTEUR, ROLE_FORMATEUR,ROLE_APPRENANT, FEED_TYPE_GENERAL, FEED_TYPE_SESSION, FEED_TYPE_GROUP, FEED_TYPE, ACHIEVEMENT_RULE, SCALE, RESOURCE_TYPE_LINK, DEFAULT_ACHIEVEMENT_RULE, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT } = require('./consts')
const mongoose = require('mongoose')
require('../../models/Resource')
const Session = require('../../models/Session')
const Message = require('../../models/Message')
const { CREATED_AT_ATTRIBUTE, PURCHASE_STATUS } = require('../../../utils/consts')
const User = require('../../models/User')
const Post = require('../../models/Post')
require('../../models/Module')
require('../../models/Sequence')
require('../../models/Search')
require('../../models/Chapter') //Added chapter, it was removed somehow
const { computeStatistics } = require('./statistics')
const { searchUsers, searchBlocks } = require('./search')
const { getUserHomeworks, getResourceType, getAchievementRules, getBlockSpentTime, getBlockSpentTimeStr, getResourcesCount, getFinishedResourcesCount, getRessourceSession } = require('./resources')
const { getBlockStatus, setParentSession, getAttribute, LINKED_ATTRIBUTES, onBlockAction, LINKED_ATTRIBUTES_CONVERSION, getSession} = require('./block')
const { getResourcesProgress } = require('./resources')
const { getResourceAnnotation } = require('./resources')
const { setResourceAnnotation } = require('./resources')
const { isResourceMine } = require('./resources')
const { getAvailableCodes } = require('./program')
const { getPathsForBlock, getTemplateForBlock } = require('./cartography')
const Program = require('../../models/Program')
const Resource = require('../../models/Resource')
const { parseAsync } = require('@babel/core')
const Progress = require('../../models/Progress')
const { BadRequestError } = require('../../utils/errors')
const { getTraineeResources } = require('./user')
const { isMine } = require('./message')

const GENERAL_FEED_ID='FFFFFFFFFFFFFFFFFFFFFFFF'

setMaxPopulateDepth(MAX_POPULATE_DEPTH)

const BLOCK_MODELS=['block', 'program', 'module', 'sequence', 'resource', 'session', 'chapter']

BLOCK_MODELS.forEach(model => {
  declareFieldDependencies({model, field: 'url', requires: 'origin.url'})
  declareVirtualField({model, field: 'children_count', instance: 'Number'})
  declareFieldDependencies({model, field: 'resource_type', requires: 'origin.resource_type'})
  declareEnumField({model, field: 'resource_type', enumValues: RESOURCE_TYPE})
  declareVirtualField({model, field: 'children', instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'block'}},
  })
  declareComputedField({model, field: 'spent_time', getterFn: getBlockSpentTime})
  declareComputedField({model, field: 'spent_time_str', getterFn: getBlockSpentTimeStr})
  declareEnumField({model, field: 'achievement_status', enumValues: BLOCK_STATUS})
  declareComputedField({model, field: 'achievement_status', getterFn: getBlockStatus})
  declareComputedField({model, field: 'finished_resources_count', getterFn: getFinishedResourcesCount})
  declareComputedField({model, field: 'resources_progress', getterFn: getResourcesProgress})
  declareComputedField({model, field: 'annotation', getterFn: getResourceAnnotation, setterFn: setResourceAnnotation})
  declareVirtualField({model, field: 'is_template', instance: 'Boolean'})
  declareVirtualField({model, field: 'search_text', instance: 'String', requires: 'code,name',
    dbFilter: value => ({$or:[{name: value}, {code: value}]}),
  })
  declareComputedField({model, field: 'homeworks', getterFn: getUserHomeworks})
  declareEnumField({model, field: 'achievement_rule', enumValues: ACHIEVEMENT_RULE})
  LINKED_ATTRIBUTES.forEach(attName => 
    declareComputedField({model, field: attName, getterFn: getAttribute(attName)})
  )
  declareComputedField({model, field: 'used_in', getterFn: getPathsForBlock})
  declareVirtualField({model, field: 'plain_url', type: 'String'})
  declareComputedField({model, field: 'resources_count', getterFn: getResourcesCount})
  declareComputedField({model, field: 'session', getterFn: getSession, requires:'parent.parent.parent.parent.parent'})
})

declareEnumField({model: 'homework', field: 'scale', enumValues: SCALE})

declareEnumField({model:'program', field: 'status', enumValues: PROGRAM_STATUS})
declareComputedField({model: 'program', field: 'available_codes', requires: 'codes', getterFn: getAvailableCodes})

declareComputedField({model: 'resource', field: 'mine', getterFn: isResourceMine})

declareEnumField({model: 'feed', field: 'type', enumValues: FEED_TYPE})

declareEnumField({model: 'post', field: '_feed_type', enumValues: FEED_TYPE})

declareEnumField({model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})

const USER_MODELS=['user', 'loggedUser', 'contact']
USER_MODELS.forEach(model => {
  declareEnumField({model, field: 'role', instance: 'String', enumValues: ROLES})
  declareComputedField({model, field: 'resources', getterFn: getTraineeResources})
})

// search start
declareComputedField({model: 'search', field: 'users', getterFn: searchUsers})
declareFieldDependencies({model: 'search', field: 'blocks', requires: 'pattern'})
declareComputedField({model: 'search', field: 'blocks', getterFn: searchBlocks})
declareFieldDependencies({model: 'search', field: 'users', requires: 'pattern'})
// search end

// Progress start
declareEnumField({model: 'progress', field: 'achievement_status', enumValues: BLOCK_STATUS})
// Progress end

// Message start
declareComputedField({model: 'message', field: 'mine', getterFn:isMine})
// Message end

const preCreate = async ({model, params, user}) => {
  params.creator=params.creator || user._id
  params.last_updater=user._id
  if ('homework'==model) {
    params.trainee=user
  }
  if (model=='resource') {
    if (!params.url && !params.plain_url) {
      throw new Error(`Vous devez télécharger un fichier ou saisir une URL`)
    }
    if (params.plain_url) {
      params.resource_type=RESOURCE_TYPE_LINK
      params.url=params.plain_url
    }
    else {
      const foundResourceType=await getResourceType(params.url)
      params.resource_type=foundResourceType
    }
    params.achievement_rule=DEFAULT_ACHIEVEMENT_RULE[params.resource_type]
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

const prePut = async ({model, id, params, user, skip_validation}) => {
  if (model=='resource') {
    const block=await Resource.findById(id, {resource_type:1, origin:1})
    if (!block.origin) {
      if (!params.url && !params.plain_url) {
        throw new Error(`Vous devez télécharger un fichier ou saisir une URL`)
      }
      if (params.plain_url) {
        params.resource_type=RESOURCE_TYPE_LINK
        params.url=params.plain_url
      }
      else {
        const foundResourceType=await getResourceType(params.url)
        params.resource_type=foundResourceType
      }
      if (block.resource_type!=params.resource_type) {
        throw new Error(`Le type de ressource ne peut changer`)
      }
      params.achievement_rule=DEFAULT_ACHIEVEMENT_RULE[params.resource_type]
    }

  }
  return {model, id, params, user, skip_validation}
}

setPrePutData(prePut)

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

const preprocessGet = async ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  // Add resource.creator.role to filter after
  if (BLOCK_MODELS.includes(model)) {
    if (model=='resource') {
      fields=[...fields, 'creator']
    }
    // Full list: only return template blocks not included in sessions
    if (!id && model!='session') {
      params['filter._locked']=false // No session data
      params['filter.origin']=null // Templates only
      }
  }

  // If a student loads a resource, mark as CURRENT
  if (model=='resource' && !!id) {
    const block=await Block.findById(id)
    // If in session && user is student, set to current
    if (block._locked && user.role==ROLE_APPRENANT) {
      await Progress.findOneAndUpdate(
        {block, user},
        {block, user, consult: true, consult_partial: true, join_partial: true, download: true},
        {upsert: true},
      )
      await onBlockAction(user, block)
    }
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

  if (model=='session') {
    if (user.role==ROLE_APPRENANT) {
      params['filter._locked']=true
      params['filter.trainees']=user._id
    }
  }
  return Promise.resolve({model, fields, id, user, params})
}

setPreprocessGet(preprocessGet)

const filterDataUser = async ({model, data, id, user}) => {
  return data
}

setFilterDataUser(filterDataUser)

const postPutData = async ({model, id, attribute, data, user}) => {
  if (BLOCK_MODELS.includes(model)) {
    await mongoose.models[model].findByIdAndUpdate(id, {$set: {last_updater: user}})
  }
  return data
}

setPostPutData(postPutData)

const preDeleteData = async ({model, data}) => {
  if (BLOCK_MODELS.includes(model)) {
    const hasLinkedBlock=await Block.exists({origin: data._id})
    if (hasLinkedBlock) {
      throw new Error(`Cette donnée est utilisée et ne peut être supprimée`)
    }
    const hasParent=await Block.exists({_id: data._id, parent: {$ne: null}})
    if (hasParent) {
      throw new Error(`Can not delete ; use removeChild instead`)
    }
  }
  else if (model=='productCode') {
    const usedPrograms=await Program.find({codes: data._id})
    if (!lodash.isEmpty(usedPrograms)) {
      const templates=await Promise.all(usedPrograms.map(p => getTemplateForBlock(p._id)))
      throw new Error(`Ce code est utilisé par ${templates.map(t => t.name)}`)
    }
  }
  return {model, data}
}

setPreDeleteData(preDeleteData)

const cloneNodeData = node => {
  return lodash.omit(node.toObject(), 
    [...LINKED_ATTRIBUTES, 'status', 'achievement_status', 'children', '_id', 'id', 'spent_time', 'creation_date', 'update_date',
    'duration_str'
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

const setSessionInitialStatus = async (blockId, trainees) => {
  const block=await Block.findById(blockId).populate('children')
  await Promise.all(trainees.map(t => Progress.findOneAndUpdate(
      {block: block._id, user: t._id},
      {block: block._id, user: t._id, achievement_status: BLOCK_STATUS_TO_COME},
      {upsert: true}
    )
  ))
  return Promise.all(block.children.map(child => setSessionInitialStatus(child, trainees)))
}

const forceLinkedAttributes = async block => {
  const log=/669fadcc3d858662e785fe16/.test(block._id.toString()) ? console.log : () => {}
  return Promise.all(LINKED_ATTRIBUTES.map(async k => {
    const v=await getAttribute(k)(null, null, block)
    log('attribute', k, v)
    const modifiedV=LINKED_ATTRIBUTES_CONVERSION[k](v, block._id)
    block[k]=modifiedV
  }))
}

const lockSession = async blockId => {
  const toManage=[await Block.findById(blockId)]
  while (toManage.length>0) {
    let block=toManage.pop()
    if (!block) {
      throw new Error('blcok numm')
    }
    const children=await Block.find({parent: block._id})
    if (block.type=='session') {
      if (lodash.isEmpty(block.trainers)) {
        throw new BadRequestError(`Démarrage session impossible: pas de formateur`)
      }
      if (lodash.isEmpty(block.trainees)) {
        throw new BadRequestError(`Démarrage session impossible: pas d'apprenant`)
      }
      if (lodash.isEmpty(children)) {
        throw new BadRequestError(`Démarrage session impossible: pas de programme`)
      }
    }
    if (block._locked) {
      console.warn(`Session block`, block._id, block.type, `is already locked but next actions will be executed`)
    }
    if (block.type=='session') {
      setSessionInitialStatus(block._id, block.trainees)
    }

    // Force attributes
    if (!['session'].includes(block.type)) {
      await forceLinkedAttributes(block)
    }
    block._locked=true
    await block.save().catch(err => {
      err.message=`${block._id}:${err}`
      throw err
    })
    toManage.push(...children)
  }
}

module.exports={
  lockSession, setSessionInitialStatus
}