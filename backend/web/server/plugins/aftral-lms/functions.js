const Block = require('../../models/Block')
const lodash=require('lodash')
const {
  declareVirtualField, setPreCreateData, setPreprocessGet, setMaxPopulateDepth, setFilterDataUser, declareComputedField, declareEnumField, idEqual, getModel, declareFieldDependencies, setPostPutData, setPreDeleteData, setPrePutData, loadFromDb,
  setPostCreateData,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES, MAX_POPULATE_DEPTH, BLOCK_STATUS, ROLE_CONCEPTEUR, ROLE_FORMATEUR,ROLE_APPRENANT, FEED_TYPE_GENERAL, FEED_TYPE_SESSION, FEED_TYPE_GROUP, FEED_TYPE, ACHIEVEMENT_RULE, SCALE, RESOURCE_TYPE_LINK, DEFAULT_ACHIEVEMENT_RULE, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, TICKET_STATUS, TICKET_TAG, PERMISSIONS, ROLE_HELPDESK } = require('./consts')
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
const { getBlockStatus, setParentSession, getAttribute, LINKED_ATTRIBUTES, onBlockAction, LINKED_ATTRIBUTES_CONVERSION, getSession, getAvailableCodes, getBlockHomeworks, getBlockHomeworksSubmitted, getBlockHomeworksMissing, getBlockTraineesCount, getBlockFinishedChildren} = require('./block')
const { getResourcesProgress } = require('./resources')
const { getResourceAnnotation } = require('./resources')
const { setResourceAnnotation } = require('./resources')
const { isResourceMine } = require('./resources')
const { getCertificate, PROGRAM_CERTIFICATE_ATTRIBUTES } = require('./program')
const { getPathsForBlock, getTemplateForBlock } = require('./cartography')
const Program = require('../../models/Program')
const Resource = require('../../models/Resource')
const Comment = require('../../models/Comment')
const { parseAsync } = require('@babel/core')
const Progress = require('../../models/Progress')
const { BadRequestError } = require('../../utils/errors')
const { getTraineeCurrentResources } = require('./user')
const { isMine } = require('./message')
const { DURATION_UNIT } = require('./consts')
const { isLiked } = require('./post')
const { getBlockLiked } = require('./block')
const { getBlockDisliked } = require('./block')
const { setBlockLiked } = require('./block')
const { setBlockDisliked } = require('./block')
const Permission = require('../../models/Permission')
const Ticket = require('../../models/Ticket')
const Group = require('../../models/Group')
const HelpDeskConversation = require('../../models/HelpDeskConversation')
const SessionConversation = require('../../models/SessionConversation')
const { getUserPermissions } = require('./user')

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
  declareComputedField({model, field: 'session', getterFn: getSession, requires:'parent'})

  declareVirtualField({model, field: 'likes_count', instance: 'Number', requires:'_liked_by'})
  declareVirtualField({model, field: 'dislikes_count', instance: 'Number', requires:'_disliked_by'})

  declareComputedField({model, field: 'liked', getterFn: getBlockLiked, setterFn: setBlockLiked, requires:'_liked_by,origin'})
  declareComputedField({model, field: 'disliked', getterFn: getBlockDisliked, setterFn: setBlockDisliked, requires:'_disliked_by,origin'})

  declareVirtualField({model, field: 'tickets_count', instance: 'Number',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'ticket'}},
  })
  declareVirtualField({model, field: 'tickets', instance: 'Array',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'ticket'}},
  })
  declareComputedField({model, field: 'available_codes', requires: 'codes,type', getterFn: getAvailableCodes})
  declareComputedField({model, field: 'homeworks', requires: '', getterFn: getBlockHomeworks})
  declareVirtualField({model, field: 'homework_limit_str', type: 'String', requires: 'homework_limit_date'})
  declareVirtualField({model, field: 'can_upload_homework', type: 'Boolean', requires: 'homework_limit_date,homework_mode'})
  declareComputedField({model, field: 'homeworks_submitted_count', type: 'Number', requires: 'session', getterFn: getBlockHomeworksSubmitted})
  declareComputedField({model, field: 'homeworks_missing_count', type: 'Number', requires: 'session', getterFn: getBlockHomeworksMissing})
  declareComputedField({model, field: 'trainees_count', type: 'Number', requires: 'session', getterFn: getBlockTraineesCount})
  declareComputedField({model, field: 'finished_children', getterFn: getBlockFinishedChildren, type:`Array`})
})

declareEnumField({model: 'homework', field: 'scale', enumValues: SCALE})

//Program start
declareEnumField({model:'program', field: 'status', enumValues: PROGRAM_STATUS})
declareEnumField({model: 'program', field: 'duration_unit', enumValues: DURATION_UNIT})
declareComputedField({
  model: 'program', 
  field: 'certificate',
  requires:PROGRAM_CERTIFICATE_ATTRIBUTES.join(','),
  getterFn: getCertificate, 
})
//Program end

declareComputedField({model: 'resource', field: 'mine', getterFn: isResourceMine})

declareEnumField({model: 'feed', field: 'type', enumValues: FEED_TYPE})

declareEnumField({model: 'post', field: '_feed_type', enumValues: FEED_TYPE})

declareEnumField({model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})

const USER_MODELS=['user', 'loggedUser', 'contact']
USER_MODELS.forEach(model => {
  declareEnumField({model, field: 'role', instance: 'String', enumValues: ROLES})
  declareComputedField({model, field: 'current_resources', getterFn: getTraineeCurrentResources})
  declareVirtualField({model, field: 'fullname', instance: 'String', requires:'firstname,lastname'})
  declareVirtualField({model, field: 'tickets_count', instance: 'Number',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'ticket'}},
  })
  declareVirtualField({model, field: 'tickets', instance: 'Array',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'ticket'}},
  })
  declareComputedField({model, field: `permissions`, requires:`permission_groups.permissions`, getterFn: getUserPermissions})
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

// Post start
declareVirtualField({model:'post', field: 'comments', instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'comment'}},
})
declareVirtualField({model:'post', field: 'comments_count', instance: 'Number',
  caster: {
    instance: 'ObjectID',
    options: {ref: 'block'}},
})
declareVirtualField({model:'post', field: 'likes_count', instance: 'Number', requires:'_liked_by'})
declareComputedField({model: 'post', field: 'liked', getterFn: isLiked, requires:'_liked_by'})
 // Post end

 // Ticket start
declareEnumField({model:'ticket', field: 'status', instance: 'String', enumValues: TICKET_STATUS})
declareEnumField({model:'ticket', field: 'tag', instance: 'String', enumValues: TICKET_TAG})
// Ticket End

 // Permission start
declareEnumField({model:'permission', field: 'value', instance: 'String', enumValues: PERMISSIONS})
 // Permission end

// Group start
declareVirtualField({model:`group`, field: `excluded_trainees`, instance: `Array`, requires: `trainees,available_trainees`, multiple: true,
  caster: {
    instance: `ObjectID`,
    options: {ref: `user`}
  }
})
declareVirtualField({model: `group`, field: `trainees_count`, instance: `Number`, requires: `trainees`})
declareVirtualField({model: `group`, field: `available_trainees_count`, instance: `Number`, requires: `available_trainees`})
declareVirtualField({model: `group`, field: `excluded_trainees_count`, instance: `Number`, requires: `trainees,available_trainees`})
// Group end

const preCreate = async ({model, params, user}) => {
  params.creator=params.creator || user._id
  params.last_updater=user._id
  if ('homework'==model) {
    params.resource=params.parent
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
  if(model=='message'){
    params.sender=params.creator
    params.receiver=params.parent
    const model = await getModel(params.parent, [`helpDeskConversation`,`sessionConversation`,`session`])
    if(model == `session`) {
      const value = user.role == ROLE_APPRENANT 
      ? user._id 
      : user.role == ROLE_FORMATEUR 
        ? params.receiver
        : null
      if(value) {
        const sessionConv = new SessionConversation({
          trainee: value,
          session: params.parent
        })
        await sessionConv.validate()
        new Message({...params, converation:sessionConv._id}).validate()
        await sessionConv.save()
        params.conversation = sessionConv._id
      }
    }
    else {
      params.conversation=params.parent
    }
  }
  if (model == 'comment'){
    params.user = user._id
    params.post = params.parent
  }

  if (model == 'ticket'){
    params.user = user._id
    params.block = params.parent
  }

  if (model == `group` && !!params.sessions && params.sessions.length >0){
    const sessions = await Session.find({_id:{$in:params.sessions}},{trainees:1}).populate('trainees')
    let trainees = sessions.flatMap(session => session.trainees)
    trainees = lodash.uniqBy(trainees, `_id`)
    trainees = lodash.sortBy(trainees, `firstname`)
    params.trainees=trainees.map(trainee=> trainee._id)
    params.available_trainees=params.trainees
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const prePut = async ({model, id, params, user, skip_validation}) => {
  if (model=='resource') {
    const block=await Resource.findById(id, {resource_type:1, origin:1, url:1, plain_url:1})
    if (!block.origin) {
      if (!params.url && !params.plain_url) {
        if(!block.url && !block.plain_url){
          throw new Error(`Vous devez télécharger un fichier ou saisir une URL`)
        }
        if(block.resource_type == RESOURCE_TYPE_LINK) {
          params.plain_url = block.url
        }
        else{
          params.url = block.url
        }
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
      // params.achievement_status = block.achievement_status
    }
  }
  if (model=='post'){
    if('liked' in params){

      await Post.updateOne(
        {_id:id},
        {
          ...params.liked ? {$addToSet: {_liked_by: user._id}}
          : {$pull: {_liked_by: user._id}}
        }
      )}
  }

  if(model == `program`) {
    const program = await Program.findById(id)
    params.codes = program.codes
    params.duration_unit = program.duration_unit
  }

  if (model == `group`){
    if(params.sessions) {
      const group = await Group.findById(id, {trainees: 1, sessions: 1, removed_trainees:1})
      const addedSessions = await Session.find({
        _id: {
          $in: lodash.difference(
            params.sessions.map(String),
            group.sessions.map(String)
          ),
        },
      })

      const untouchedSessions = await Session.find({
        _id: {
          $in: lodash.intersection(
            group.sessions.map(String),
            params.sessions.map(String)
          ),
        },
      })

      const untouchedSessionTrainees = lodash.flatten(
        untouchedSessions.map(session => session.trainees.map(String))
      )

      const addedSessionTrainees = lodash.flatten(
        addedSessions.map(session => session.trainees.map(String))
      )

      const addedTrainees = lodash.difference(
        addedSessionTrainees,
        untouchedSessionTrainees
      )

      const trainees = await User.find({_id:{$in:[...untouchedSessionTrainees, ...addedTrainees]}},{firstname:1}).sort('firstname')
      params.trainees=trainees.map(t=>t._id)
    }
  }
  if(model == `message`) {
    params.conversation = params.parent
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

const getFeed = async (id) => {
  let type, name

  if (id === GENERAL_FEED_ID) {
    type = FEED_TYPE_GENERAL
    name = 'Forum Aftral LMS'
  } else {
    const model = await getModel(id, ['session', 'group'])
    type = model === 'session' ? FEED_TYPE_SESSION : FEED_TYPE_GROUP
    const feed = await mongoose.connection.models[model].findById(id)
    name = feed.name
  }

  let posts = await Post.find({ _feed: id })
    .populate('author')
    .populate('comments')
    .populate('comments_count')

  posts = await Promise.all(posts.map(async (post) => {
    const comments = await Promise.all(post.comments.map(async (comment) => {
      const user = await User.findById(comment.user)
      return {
        ...comment.toObject(),
        user,
      }
    }))

    return {
      ...post.toObject(),
      comments,
    }
  }))

  return {
    _id: id,
    type,
    name,
    posts,
  }
};


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
    if (!id && model!='session' && user.role==ROLE_CONCEPTEUR) {
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
  if (model == `helpDeskConversation` && !id && user.role !== ROLE_HELPDESK) {
    params['filter.user']=user
  }
  
  if (model == `sessionConversation` && !id) {
    let filter
    if(user.role == ROLE_APPRENANT) {
      filter = {trainees:user._id}
    }
    else if(user.role == ROLE_FORMATEUR) {
      filter = {trainers:user._id}
    }
    const sessions = await Session.find({...filter})
    params[`filter.session`] = {$in: sessions}
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

//Make sure permissions are upserted
Promise.all(
  Object.entries(PERMISSIONS).map(([key, value]) =>
    Permission.findOneAndUpdate(
      { value },
      { value, key },
      { upsert: true }
    )
  )
)
  .then(() => console.log('Permission upserts completed successfully.'))
  .catch((error) => console.error('An error occurred during permission upserts:', error))

const postCreate = async ({model, params, data}) => {
  if(model == `homework`) {
    await Progress.findOneAndUpdate(
      {block:data.resource, user:data.trainee._id},
      {$addToSet: {homeworks:data._id}}
    )
  }

  if(model == `ticket`) {
    const conv = await HelpDeskConversation.create({
      ticket: data._id,
      user: data.user,
      block: data.block,
    })
    await Ticket.findOneAndUpdate(
      {_id:data._id},
      {conversation: conv._id}
    )
  }
}

setPostCreateData(postCreate)

module.exports={
  lockSession, setSessionInitialStatus, preCreate, prePut
}