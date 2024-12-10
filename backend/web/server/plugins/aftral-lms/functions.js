const Block = require('../../models/Block')
const moment=require('moment')
const lodash=require('lodash')
const {
  declareVirtualField, setPreCreateData, setPreprocessGet, setMaxPopulateDepth, setFilterDataUser, declareComputedField, declareEnumField, idEqual, getModel, declareFieldDependencies, setPostPutData, setPreDeleteData, setPrePutData, loadFromDb,
  setPostCreateData,
  setScormCallbackPost,
  setScormCallbackGet,
  getDateFilter,
} = require('../../utils/database')
const { RESOURCE_TYPE, PROGRAM_STATUS, ROLES, MAX_POPULATE_DEPTH, BLOCK_STATUS, ROLE_CONCEPTEUR, ROLE_FORMATEUR,ROLE_APPRENANT, FEED_TYPE_GENERAL, FEED_TYPE_SESSION, FEED_TYPE_GROUP, FEED_TYPE, ACHIEVEMENT_RULE, SCALE, RESOURCE_TYPE_LINK, DEFAULT_ACHIEVEMENT_RULE, BLOCK_STATUS_TO_COME, BLOCK_STATUS_CURRENT, TICKET_STATUS, TICKET_TAG, PERMISSIONS, ROLE_HELPDESK, RESOURCE_TYPE_SCORM, BLOCK_TYPE_SESSION, ROLE_ADMINISTRATEUR, ROLE_GESTIONNAIRE, PROGRAM_STATUS_AVAILABLE, RESOURCE_TYPE_VISIO, BLOCK_TYPE_RESOURCE, BLOCK_TYPE_MODULE, BLOCK_TYPE_SEQUENCE, BLOCK_TYPE_LABEL, BLOCK_TYPE_PROGRAM, VISIO_TYPE, BLOCK_STATUS_FINISHED } = require('./consts')
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
const { getUserHomeworks, getResourceType, getAchievementRules, getBlockSpentTime, getBlockSpentTimeStr, getResourcesCount, getFinishedResourcesCount, getRessourceSession, getBlockChildren} = require('./resources')
const { getBlockStatus, setParentSession, LINKED_ATTRIBUTES, onBlockAction, LINKED_ATTRIBUTES_CONVERSION, getSession, getAvailableCodes, getBlockHomeworks, getBlockHomeworksSubmitted, getBlockHomeworksMissing, getBlockTraineesCount, getBlockFinishedChildren, getSessionConversations, propagateAttributes, getBlockTicketsCount, setScormData, getBlockNote, setBlockNote, getBlockScormData, getFinishedChildrenCount, getBlockNoteStr, getSessionProof, ensureValidProgramProduction, getFilteredTrainee, getTopParent} = require('./block')
const { getResourcesProgress } = require('./resources')
const { getResourceAnnotation } = require('./resources')
const { setResourceAnnotation } = require('./resources')
const { isResourceMine } = require('./resources')
const { getSessionCertificate, PROGRAM_CERTIFICATE_ATTRIBUTES, getEvalResources } = require('./program')
const { getPathsForBlock, getTemplateForBlock } = require('./cartography')
const Program = require('../../models/Program')
const Resource = require('../../models/Resource')
const Comment = require('../../models/Comment')
const { parseAsync } = require('@babel/core')
const Progress = require('../../models/Progress')
const { BadRequestError, ForbiddenError } = require('../../utils/errors')
const { getTraineeCurrentResources, getUserCanUploadHomework } = require('./user')
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
const Search = require('../../models/Search')
const Conversation = require('../../models/Conversation')
const cron = require('../../utils/cron')
const { isDevelopment } = require('../../../config/config')
const {pollNewFiles}=require('./ftp')
const { session } = require('passport')
const { getGroupVisiosDays, getUserVisiosDays, getVisioTypeStr, getSessionVisiosDays } = require('./visio')
const { createRoom } = require('../visio/functions')
const { getGroupTrainees } = require('./group')
const { getCertificateName } = require('./utils')
const { sendCertificate } = require('./mailing')
require('../visio/functions')

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
  declareComputedField({model, field: 'achievement_status', requires: 'type', getterFn: getBlockStatus})
  declareComputedField({model, field: 'finished_resources_count', getterFn: getFinishedResourcesCount})
  declareComputedField({model, field: 'resources_progress', getterFn: getResourcesProgress})
  declareComputedField({model, field: 'annotation', getterFn: getResourceAnnotation, setterFn: setResourceAnnotation})
  declareVirtualField({model, field: 'is_template', instance: 'Boolean'})
  declareVirtualField({model, field: 'search_text', instance: 'String', requires: 'code,name',
    dbFilter: value => ({$or:[{name: value}, {code: value}]}),
  })
  declareComputedField({model, field: 'homeworks', getterFn: getUserHomeworks})
  declareEnumField({model, field: 'achievement_rule', enumValues: ACHIEVEMENT_RULE})
  declareComputedField({model, field: 'used_in', getterFn: getPathsForBlock})
  declareVirtualField({model, field: 'plain_url', type: 'String'})
  declareComputedField({model, field: 'resources_count', getterFn: getResourcesCount})
  declareComputedField({model, field: 'session', getterFn: getSession, requires:'parent'})

  declareVirtualField({model, field: 'likes_count', instance: 'Number', requires:'_liked_by'})
  declareVirtualField({model, field: 'dislikes_count', instance: 'Number', requires:'_disliked_by'})

  declareComputedField({model, field: 'liked', getterFn: getBlockLiked, setterFn: setBlockLiked, requires:'_liked_by,origin'})
  declareComputedField({model, field: 'disliked', getterFn: getBlockDisliked, setterFn: setBlockDisliked, requires:'_disliked_by,origin'})
  declareVirtualField({model, field: 'tickets', instance: 'Array',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'ticket'}},
  })
  declareComputedField({model, field: 'available_codes', requires: 'codes,type', getterFn: getAvailableCodes})
  declareComputedField({model, field: 'homeworks', requires: '', getterFn: getBlockHomeworks})
  declareVirtualField({model, field: 'homework_limit_str', type: 'String', requires: 'homework_limit_date'})
  declareComputedField({model, field: 'can_upload_homework', type: 'Boolean', requires: 'homework_limit_date,homework_mode,max_attempts', getterFn: getUserCanUploadHomework})
  declareComputedField({model, field: 'homeworks_submitted_count', type: 'Number', requires: 'session', getterFn: getBlockHomeworksSubmitted})
  declareComputedField({model, field: 'homeworks_missing_count', type: 'Number', requires: 'session', getterFn: getBlockHomeworksMissing})
  declareComputedField({model, field: 'trainees_count', type: 'Number', requires: 'session', getterFn: getBlockTraineesCount})
  declareComputedField({model, field: 'finished_children', getterFn: getBlockFinishedChildren, type:`Array`})
  declareComputedField({model, field: 'finished_children_count', getterFn: getFinishedChildrenCount, type:`Number`})
  declareComputedField({model, field: 'tickets_count', getterFn: getBlockTicketsCount})
  declareEnumField({model, field: 'scale', enumValues: SCALE})
  declareComputedField({model, field: 'note', requires: 'resource_type,homework_mode,type', getterFn: getBlockNote, setterFn: setBlockNote})
  declareComputedField({model, field: 'note_str', requires: 'note,success_scale,success_note_max,type', getterFn: getBlockNoteStr})
  declareComputedField({model, field: 'evaluation_resources', getterFn: getEvalResources})
  declareVirtualField({model, field: 'type_str', type: 'String', requires: 'type'})
  declareComputedField({model, field: 'proof', requires: 'trainees.fullname', getterFn: getSessionProof})
  declareComputedField({model,  field: 'certificate', requires: 'type,trainees.fullname,children,end_date,location,code', getterFn: getSessionCertificate })
  declareVirtualField({model, field: 'fullname', type: 'String', requires: 'type,order,name,closed,access_condition'})
  
})

//Program start
declareEnumField({model:'program', field: 'status', enumValues: PROGRAM_STATUS})
declareEnumField({model: 'program', field: 'duration_unit', enumValues: DURATION_UNIT})
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
  declareComputedField({model, field: `visios`, getterFn: getUserVisiosDays})
})

// search start
declareComputedField({model: 'search', field: 'users', getterFn: searchUsers})
declareFieldDependencies({model: 'search', field: 'blocks', requires: 'pattern'})
declareComputedField({model: 'search', field: 'blocks', getterFn: searchBlocks})
declareFieldDependencies({model: 'search', field: 'users', requires: 'pattern'})
// search end

// Progress start
declareEnumField({model: 'progress', field: 'achievement_status', enumValues: BLOCK_STATUS})
declareVirtualField({model: 'progress', field: 'homeworks', instance: 'Array',
  caster: {
    instance: 'ObjectID',
    options: {ref: 'homework'}},
})
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
declareVirtualField({model:'ticket', field: 'number', instance: 'String', requires: '_number'})
 // Ticket end

 // Permission start
declareEnumField({model:'permission', field: 'value', instance: 'String', enumValues: PERMISSIONS})
 // Permission end

// Group start
declareVirtualField({model: `group`, field: `trainees_count`, instance: `Number`, requires: 'sessions'})
declareComputedField({model: `group`, field: `visios`, getterFn: getGroupVisiosDays})
declareComputedField({model: `group`, field: `trainees`, requires: 'sessions.trainees.fullname', getterFn: getGroupTrainees})
// Group end

// HelpDeskConversation start
const CONVERSATION_MODELS = [`helpDeskConversation`, `sessionConversation`, `conversation`]
CONVERSATION_MODELS.forEach(model => {
  declareVirtualField({model, field: 'messages', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'message'}},
  })
  declareVirtualField({model, field: 'messages_count', instance: 'Number',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'message'}},
  })
  declareVirtualField({model, field: 'newest_message', instance: 'Array', multiple: false,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'message'}},
  })
})
// HelpDeskConversation end

// Session start
declareComputedField({model: 'session', field: 'conversations', getterFn: getSessionConversations})
declareComputedField({model: 'session', field: 'filtered_trainee', requires: 'trainees', getterFn: getFilteredTrainee})
declareComputedField({model: `session`, field: `visios`, getterFn: getSessionVisiosDays, requires: 'trainees'})
declareVirtualField({model: `session`, field: `display_name`, instance: 'String', requires: 'session_product_code,code'})
// Session end

// Homework start
declareEnumField({model: 'homework', field: 'scale', enumValues: SCALE})
// Homework end

// Visio start
declareVirtualField({model: 'visio', field: 'type', requires: '_owner_type', enumValues: VISIO_TYPE, instance: 'String'})
declareComputedField({model: 'visio', field: 'type_str', requires: 'type', instance: 'String', getterFn: getVisioTypeStr})
declareVirtualField({model: 'visio', field: 'active', requires: 'start_date,end_date', instance: 'Boolean'})
// Visio end

const preCreate = async ({model, params, user}) => {
  params.creator=params.creator || user._id
  params.last_updater=user._id
  if ('homework'==model) {
    params.resource=params.parent
    params.trainee=user
  }
  if (model=='resource') {
    if (params.max_attempts && params.resource_type != RESOURCE_TYPE_SCORM) {
      throw new Error(`Vous ne pouvez pas mettre de nombre de tentatives maximum sur une ressource autre qu'un SCORM`)
    }
    if (!params.success_note_max && params.resource_type == RESOURCE_TYPE_SCORM) {
      params.success_note_max=100
    }
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
    // Set default code if missing
    if (!params.code) {
      const PREFIXES={
        [RESOURCE_TYPE_LINK]: 'URL',
        [RESOURCE_TYPE_VISIO]: 'CLV',
      }
      const prefix=PREFIXES[params.resource_type] || 'DIV'
      const count = await mongoose.models.block.countDocuments({ code: new RegExp(`^${prefix}_`) })
      params.code=`${prefix}_${String(count + 1).padStart(5, '0')}`
    }
  }
  if (model=='post') {
    params.author=user
    const parentId=params.parent
    // trainee, trainer & manager can not post on general feed
    if (parentId==GENERAL_FEED_ID && [ROLE_APPRENANT, ROLE_FORMATEUR, ROLE_GESTIONNAIRE].includes(user.role)) {
      throw new ForbiddenError(`Ce forum est verrouillé`)
    }
    // If in a non visible group or session, forbid
    const canPost=(await Group.exists({_id: parentId, can_post_feed: true})) || (await Session.exists({_id: parentId, can_post_feed: true}))
    if (!canPost && user.role==ROLE_APPRENANT) {
      throw new ForbiddenError(`Ce forum est verrouillé`)
    }
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
    await getModel(params.parent, [`helpDeskConversation`,`sessionConversation`])
    params.conversation=params.parent
  }
  if (model == 'comment'){
    params.user = user._id
    params.post = params.parent
  }

  if (model == 'ticket'){
    if (!([ROLE_FORMATEUR, ROLE_APPRENANT].includes(user.role))) {
      throw new ForbiddenError(`Vous ne pouvez pas créer de ticket`)
    }
    params.user = user._id
    params.block = params.parent
    params.session=params.session || (await getSession(user._id, null, {_id: params.block}, []))?._id
  }

  if (model == `group` && !!params.sessions && params.sessions.length >0){
    const sessions = await Session.find({_id:{$in:params.sessions}},{trainees:1}).populate('trainees')
    let trainees = sessions.flatMap(session => session.trainees)
    trainees = lodash.uniqBy(trainees, `_id`)
    trainees = lodash.sortBy(trainees, `firstname`)
    params.trainees=trainees.map(trainee=> trainee._id)
    params.available_trainees=params.trainees
  }

  if (model == `sessionConversation`) {
    if(![ROLE_APPRENANT, ROLE_FORMATEUR].includes(user.role)) {
      throw new ForbiddenError(`Only Trainers or Trainees can create SessionConversations`)
    }
    params.session = params.parent
    params.trainee = user.role == ROLE_APPRENANT ? params.creator : params.user
    const conv = await SessionConversation.findOne({
      session: mongoose.Types.ObjectId(params.parent), 
      trainee: params.trainee,
    })
    if(conv) {
      return {data: conv}
    }
  }

  if (model == `homework` ){
    const [block] = await loadFromDb({model: `resource`, id: params.parent, user, fields:[`can_upload_homework`]})
    if(!block.can_upload_homework) {
      throw new ForbiddenError(`Vous ne pouvez plus importer de devoir`)
    }
  }

  if (model=='user') {
    params.plain_password=params.password
  }

  if (model=='visio') {
    const ALLOWED_CREATORS=[ROLE_CONCEPTEUR, ROLE_FORMATEUR]
    if (!(ALLOWED_CREATORS.includes(user.role))) {
      throw new ForbiddenError(`Seuls ${ALLOWED_CREATORS.map(r => ROLES[r]).join(',')} peuvent créer une classe virtuelle`)
    }
    if (!params.parent) {
      throw new BadRequestError(`Le parent de la visio (groupe, session, user) est obligatoire`)
    }
    const parentModel=await getModel(params.parent, ['group', 'user', 'session'])
    params._owner=params.parent
    params._owner_type=parentModel
    if (params.start_date && params.duration) {
      console.log(params.duration, typeof params.duration)
      params.end_date=moment(params.start_date).add(params.duration, 'minutes')
    }
    if (!!params.start_date && !!params.duration && !!params.title) {
      const {url, room}=await createRoom(params.start_date, params.duration, params.title)
      params.url=url
      params._room=room
    }

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

  if (model=='program' && params.status==PROGRAM_STATUS_AVAILABLE) {
    await ensureValidProgramProduction(id)
  }

  // #230 Check only MSR inside program can be optional
  if ('optional' in params && BLOCK_MODELS.includes(model)) {
    const block=await mongoose.models.block.findById(id)
    const optional=params.optional=='true' || params.optional===true
    // Can not set mandatory if parent is optional
    if (!optional) {
      const optionalParent=await Block.exists({_id: block.parent, optional: true})
      if (optionalParent) {
        throw new BadRequestError(`${block.type_str} ${block.name} ne peut être obligatoire car son parent est facultatif`)
      }
    }
    if (optional) {
      const ALLOWED_OPTIONALS=[BLOCK_TYPE_MODULE, BLOCK_TYPE_SEQUENCE, BLOCK_TYPE_RESOURCE]
      if (!(ALLOWED_OPTIONALS.includes(block.type))) {
        throw new BadRequestError(`Seuls ${ALLOWED_OPTIONALS.map(t => BLOCK_TYPE_LABEL[t])} peuvent être facultatifs`)
      }
      const topParent=await getTopParent(id)
      if (topParent.type!=BLOCK_TYPE_PROGRAM) {
        throw new BadRequestError(`${ALLOWED_OPTIONALS.map(t => BLOCK_TYPE_LABEL[t])} ne peuvent être facultatifs qu'au sein d'un programme`)
      }
    }
    const wasOptional=!!block.optional
    if (wasOptional != optional) {
      params.toggleOptional=true
    }
  }

  if (model=='visio') {
    if (!!params.start_date && !!params.duration && !params.end_date) {
      params.end_date=moment(params.start_date).add(params.duration, 'minutes')
    }
    if (!!params.start_date && !!params.duration) {
      const title=(await mongoose.models.visio.findById(id)).title
      const {url, room}=await createRoom(params.start_date, params.duration, title)
      params.url=url
      params._room=room
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
    if (model=='session') {
      name= `${feed.code} ${name}`
    }
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
    const sessionIds=(await Session.find({$or: [{trainers: user._id}, {trainees: user._id}], visible_feed: true})).map(s => s._id)
    ids=[...sessionIds, GENERAL_FEED_ID]
    const groupIds=(await Group.find({sessions: {$in:sessionIds}, visible_feed: true})).map(s => s._id)
    ids=[...ids, ...groupIds]
  }
  else {
    ids=[id]
  }
  return Promise.all(ids.map(sessId => getFeed(sessId)))
}

const preprocessGet = async ({model, fields, id, user, params}) => {

  // Update trainee connection
  if (['block', BLOCK_TYPE_SESSION].includes(model) && !!id && user?.role==ROLE_APPRENANT) {
    const block=await Block.findById(id)
    if (block.type==BLOCK_TYPE_SESSION) {
      if (!block._trainees_connections.find(tc => idEqual(tc.trainee, user._id))) {
        await Session.findByIdAndUpdate(id, {$push: {_trainees_connections: {trainee: user._id, date: moment()}}})
      }
    }
  }
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  // Add resource.creator.role to filter after
  if (BLOCK_MODELS.includes(model)) {
    if (model=='resource') {
      fields=[...fields, 'creator']
    }

    // Full list: only return template blocks not included in sessions for builder & helpdesk
    if (!id && model!='session' && [ROLE_CONCEPTEUR, ROLE_HELPDESK, ROLE_ADMINISTRATEUR].includes(user.role)) {
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
        {block, user, consult: true, join_partial: true, download: true, 
          //if scorm, increment attempts count
          ...block.resource_type == RESOURCE_TYPE_SCORM ? {$inc: { attempts_count: 1 }} : {}
        },
        {upsert: true},
      )
      await onBlockAction(user._id, block._id)
    }
  }
  if (model == 'contact') {
    return getContacts(user, id)
      .then(res => {
        return Promise.resolve({data: res})
      }) 
  }

  if (model == 'feed') {
    let feeds=await getFeeds(user, id)
    const sessions=await Session.find({_id: {$in: feeds.map(f => f._id)}})
    feeds=feeds.filter(feed => {
      const session=sessions.find(s => idEqual(s._id, feed._id))
      return !session || moment().isBetween(session.start_date, session.end_date)
    })
    return ({data: feeds})
  }

  if (model=='statistics') {
    return computeStatistics({model, fields, id, user, params})
      .then(data => ({data}))
  }
  if (model == `helpDeskConversation` && !id && ![ROLE_HELPDESK, ROLE_CONCEPTEUR].includes(user.role)) {
    params['filter.user']=user
  }

  // To filter current sessions in filterDataUser
  if (model=='session') {
    fields=lodash.uniq([...fields, 'start_date', 'end_date'])
  }
  if (model=='session' && !id) {
    if (user.role==ROLE_APPRENANT) {
      params['filter._locked']=true
      params['filter.trainees']=user._id
      // To filter finished session in filterDataUser
    }
    if (user.role==ROLE_FORMATEUR) {
      params['filter._locked']=true
      params['filter.trainers']=user._id
    }
  }

  // A session may be provided an id composed with a trainee also (for statistics)
  if (typeof(id)=='string' && id.includes('-')) {
    if (id.includes('-')) {
      const ids=id.split('-')
      const models=await Promise.all(ids.map(id => getModel(id, ['session', 'user'])))
      id=models[0]=='session' ? ids[0] : ids[1]
      user=await User.findById(models[0]=='user' ? ids[0] : ids[1])
      // Skip filtering trainee sessions
      params.manager=true
    }
  }
  if (model == `search`) {
    params[`filter.creator`] = user._id
    id=undefined
  }

  if (model == `ticket` && ![ROLE_CONCEPTEUR, ROLE_HELPDESK].includes(user.role)) {
    params[`filter.user`] = user._id
  }

  // To filter group containing sessions I belong to
  if (model=='group') {
    if ([ROLE_FORMATEUR, ROLE_APPRENANT].includes(user.role) && !id) {
      const sessions=await Session.find({$or: [{trainers: user._id}, {trainees: user._id}]}, {_id:1})
      params['filter.sessions']={$in: sessions}
    }
  }
  
  return Promise.resolve({model, fields, id, user, params})
}

setPreprocessGet(preprocessGet)

const filterDataUser = async ({model, data, id, user, params}) => {
  // If a manager is loading, don't filter sessions
  if (!params.manager && model=='session' && [ROLE_APPRENANT, ROLE_FORMATEUR].includes(user.role)) {
    data=data.filter(d => moment().isBetween(d.start_date, d.end_date))
  }
  if (model=='feed' && [ROLE_APPRENANT, ROLE_FORMATEUR].includes(user.role)) {
    data=data.filter(async d => {
      const session=await Session.findBy(d._id)
      return session && moment().isBetween(session.start_date, session.end_date)
    })
    data=[]
  }

  return data
}

setFilterDataUser(filterDataUser)

const postPutData = async ({model, id, attribute, params, data, user}) => {
  const sessionBlock=await Block.exists({_locked: true, _id: id})
  // Don't propagate any data from session blocks
  if (sessionBlock) {
    return data
  }
  // Propagate block attributes
  if (BLOCK_MODELS.includes(model)) {
    await mongoose.models[model].findByIdAndUpdate(id, {$set: {last_updater: user}})
    await propagateAttributes(id)
  }
  // Set children optional recursively
  if (BLOCK_MODELS.includes(model) && !!params.toggleOptional) {
    const newOptional=await Block.exists({_id: id, optional: true})
    const children=await getBlockChildren({blockId: id})
    await Block.updateMany({_id: {$in: children}}, {optional: newOptional})
  }
  if (model=='homework') {
    await onBlockAction(data.trainee, data.resource)
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
      {conversation: [conv._id]}
    )
  }

  if(model == `search`) {
    await Search.deleteMany(
      {creator:data.creator, _id:{$ne:data._id}}
    )
  }

  return data
}

setPostCreateData(postCreate)

const scormCalbackPost = async ({user, data}) => {
  return setScormData(user._id, data.resourceId, data.scormData)
}

setScormCallbackPost(scormCalbackPost)

const scormCalbackGet = async ({user, resource}) => {
  let loadedData=await getBlockScormData(user, resource)
  const data={
    'cmi.core.student_name': user.fullname,
    'cmi.core.student_id': user._id.toString(),
    ...loadedData,
  }
  return data
}

setScormCallbackGet(scormCalbackGet)

const POLLING_FREQUENCY='0 */5 * * * *'
!isDevelopment() && cron.schedule(POLLING_FREQUENCY, async () => {
  try {
    console.log('Polling new files')
    return await pollNewFiles().then(console.log)
  }
  catch(err) {
    console.error(`Polling error:${err}`)
  }
}, null, true, 'Europe/Paris')

// Send certifcates at session end
!isDevelopment() && cron.schedule('0 0 4 * * *', async () => {
  const yesterdayFilter=getDateFilter({attribute: 'end_date', day: moment().add(-1, 'day')})
  const sessions=await Block.find({type: 'session', ...yesterdayFilter}).populate(['children', 'trainees'])
  for (const session of sessions) {
    console.log(`Session ${session.name} finished yesterday`)  
    for (const trainee of session.trainees) {
      const progress=await Progress.findOne({block: session._id, user: trainee._id, achievement_status: BLOCK_STATUS_FINISHED})
      if (progress) {
        const certif_name=await getCertificateName(session._id, trainee._id)
        const certificate=await getSessionCertificate(trainee._id, null, session)
        await sendCertificate({user: trainee, session, attachment_name: certif_name, attachment_url: certificate}).catch(console.error)
      }
    }
  }
})

module.exports={
  preCreate, prePut, postCreate
}
