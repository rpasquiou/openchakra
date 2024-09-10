const mongoose = require('mongoose')
const lodash = require('lodash')
const {
  declareEnumField,
  declareVirtualField,
  setPreprocessGet,
  setPreCreateData,
  declareComputedField,
  getModel,
  setPostCreateData,
  setPostPutData,
  idEqual,
} = require('../../utils/database')
const { ROLES, SECTOR, EXPERTISE_CATEGORIES, CONTENT_TYPE, JOBS, COMPANY_SIZE, ROLE_PARTNER, ROLE_ADMIN, ROLE_MEMBER, ESTIMATED_DURATION_UNITS, LOOKING_FOR_MISSION, CONTENT_VISIBILITY, EVENT_VISIBILITY, ANSWERS, QUESTION_CATEGORIES, SCORE_LEVELS, COIN_SOURCES } = require('./consts')
const { PURCHASE_STATUS } = require('../../../utils/consts')
const Company = require('../../models/Company')
const { BadRequestError } = require('../../utils/errors')
const { getterPinnedFn, setterPinnedFn } = require('../../utils/pinned')
const Group = require('../../models/Group')
const { getterCountFn } = require('./count')
const { getContents } = require('./company')
const ExpertiseSet = require('../../models/ExpertiseSet')
const QuestionCategory = require('../../models/QuestionCategory')
const { isMineForMessage } = require('./message')
const { getConversationPartner } = require('./conversation')
const ExpertiseCategory = require('../../models/ExpertiseCategory')
const { computeScores, booleanLevelFieldName } = require('./score')
const Conversation = require('../../models/Conversation')
const User = require('../../models/User')
const Question = require('../../models/Question')
const Answer = require('../../models/Answer')
const Gain = require('../../models/Gain')
const { isMineForPost } = require('./post')
const { getRelated } = require('./related')

//User declarations
const USER_MODELS = ['user', 'loggedUser', 'admin', 'partner', 'member']
USER_MODELS.forEach(m => {
  declareEnumField({ model: m, field: 'job', enumValues: JOBS })
  declareVirtualField({ model: m, field: 'password2', instance: 'String' })
  declareVirtualField({ model: m, field: 'fullname', instance: 'String', requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'shortname', instance: 'String',requires:'firstname,lastname'})
  declareVirtualField({ model: m, field: 'pinned_by_count', instance: 'Number' })
  declareVirtualField({model: m,field: 'companies',instance: 'Array',multiple: true,requires: 'company',})
  declareVirtualField({
    model: m, field: 'pinned_users', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'user' }
    },
  })
  declareVirtualField({
    model: m, field: 'pinned_companies', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'company' }
    },
  })
  declareVirtualField({model: m, field: 'pinned_users_count', instance: 'Number'})
  declareVirtualField({model: m, field: 'pinned_companies_count', instance: 'Number'})
  declareComputedField({model: m, field: 'pinned', getterFn: getterPinnedFn(m, 'pinned_by'), setterFn: setterPinnedFn(m, 'pinned_by'), requires:'pinned_by'})
  declareEnumField({ model: m, field: 'role', enumValues: ROLES })
  declareVirtualField({
    model: m, field: 'groups', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'group' }
    },
  })
  declareVirtualField({
    model: m, field: 'pending_groups', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'group' }
    },
  })
  declareVirtualField({model: m, field: 'groups_count', instance: 'Number'})
  declareVirtualField({model: m, field: 'pending_groups_count', instance: 'Number'})
  declareComputedField({model: m, field: 'partner_count', getterFn: getterCountFn('user', {'role': ROLE_PARTNER})})
  declareComputedField({model: m, field: 'member_count', getterFn: getterCountFn('user', {'role': ROLE_MEMBER})})
  declareComputedField({model: m, field: 'user_count', getterFn: getterCountFn('user')})
  declareVirtualField({model: m, field: 'communications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'communication' }
    },
  })
  declareVirtualField({model: m, field: 'experiences', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'experience' }
    },
  })
  declareVirtualField({model: m, field: 'trainings', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'training' }
    },
  })
  declareVirtualField({model: m, field: 'is_company_admin', requires: 'company.administrators', instance: 'Boolean'})
  declareVirtualField({
    model: m,
    field: 'posts',
    instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'post' },
    },
  })
  declareVirtualField({
    model: m,
    field: 'comments',
    instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'comment' },
    },
  })
  declareVirtualField({
    model: m, field: 'scores', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'score' }
    },
  })
  declareVirtualField({model: m, field: 'latest_score',instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'score' }
    },
  })
})

//Company declarations
declareVirtualField({
  model: 'company', field: 'users', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({
  model: 'company', field: 'pinned_by', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({model: 'company', field: 'pinned_by_count', instance: 'Number'})
declareVirtualField({ model: 'company', field: 'missions', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'mission' }
  },
})
declareVirtualField({ model: 'company', field: 'events', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'event' }
  },
})
declareEnumField( {model: 'company', field: 'sector', enumValues: SECTOR})
declareEnumField( {model: 'company', field: 'size', enumValues: COMPANY_SIZE})
declareEnumField( {model: 'company', field: 'targeted_markets', enumValues: SECTOR})
declareEnumField( {model: 'company', field: 'looking_for_mission', enumValues: LOOKING_FOR_MISSION})
declareComputedField({model: 'company', field: 'pinned', getterFn: getterPinnedFn('company', 'pinned_by'), setterFn: setterPinnedFn('company', 'pinned_by'), requires:'pinned_by'})
declareComputedField({model: 'company', field: 'contents',  requires:'users', getterFn: getContents})
declareComputedField({model: 'company', field: 'related_companies',  requires:'expertise_set.expertises', getterFn: getRelated('company')})

//Expertise declarations

//Content declarations
declareEnumField( {model: 'content', field: 'type', enumValues: CONTENT_TYPE})
declareEnumField( {model: 'content', field: 'visibility', enumValues: CONTENT_VISIBILITY})
declareVirtualField({model: 'content', field: 'comments', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },})
declareVirtualField({model: 'content', field: 'comments_count', instance: 'Number'})
declareVirtualField({model: 'content', field: 'likes_count', instance: 'Number' })
declareComputedField({model: 'content', field: 'liked', getterFn: getterPinnedFn('content', '_liked_by'), setterFn: setterPinnedFn('content', '_liked_by'), requires:'_liked_by'})

//Post declarations
declareVirtualField({model: 'post', field: 'comments_count', instance: 'Number'})
declareVirtualField({model: 'post', field: 'likes_count', ROLE: 'number' })
declareVirtualField({model: 'post', field: 'comments', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },})
declareComputedField({model: 'post', field: 'liked', getterFn: getterPinnedFn('post', '_liked_by'), setterFn: setterPinnedFn('post', '_liked_by'), requires:'_liked_by'})
declareComputedField({ model: 'post', field: 'mine', requires: 'creator', getterFn: isMineForPost })


//Group declarations
declareVirtualField({model: 'group', field: 'posts', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'post' }
  },})
declareVirtualField({model: 'group', field: 'posts_count', instance: 'Number'})
declareVirtualField({model: 'group', field: 'pending_users_count', instance: 'Number'})
declareVirtualField({model: 'group', field: 'users_count', instance: 'Number'})

//Partner declarations
// Conversation
declareVirtualField({
  model: 'conversation', field: 'messages', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'message' }
  },
})
declareVirtualField({
  model: 'conversation',
  field: 'messages_count',
  instance: 'Number',
})
declareVirtualField({
  model: 'conversation',
  field: 'latest_message',
  instance: 'Array',
  multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'message' },
  },
})

declareComputedField({model: 'conversation', field: 'partner', requires: 'users', getterFn: getConversationPartner})

//Message
declareComputedField({model: 'message', field: 'mine', requires: 'sender', getterFn: isMineForMessage})
declareVirtualField({model: 'message', field: 'display_date', instance: 'String', requires: 'creation_date'})

// Category declarations
declareVirtualField({model: 'expertiseCategory', field: 'expertises', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'expertise' }
  }
})
declareEnumField( {model: 'expertiseCategory', field: 'value', enumValues: EXPERTISE_CATEGORIES})

// Event declarations
declareEnumField({model: 'event', field: 'visibility', enumValues: EVENT_VISIBILITY})
declareVirtualField({
  model: 'event', field: 'registered_users', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'user' }
  },
})
declareVirtualField({model: 'event', field: 'registered_users_count', instance: 'Number'})

// Enums Mission Schema
declareEnumField({model: 'mission', field: 'estimation_duration_unit', enumValues: ESTIMATED_DURATION_UNITS})

// ExpertiseSet declarations
declareVirtualField({model: 'expertiseSet', field: 'display_categories', requires: 'expertises,categories', instance: 'Array', multiple: true})

//Score declarations
declareVirtualField({model: 'score', field: 'deviation', requires: 'answers.answer', instance: 'Number'})
declareVirtualField({model: 'score', field: 'is_drafted', requires: 'answers.answer', instance: 'Boolean'})
declareVirtualField({model: 'score', field: 'display_by_category', requires: 'answers.question.question_category', instance: 'Array'})
declareEnumField( {model: 'score', field: 'level', enumValues: SCORE_LEVELS})

//Answer declaration
declareEnumField( {model: 'answer', field: 'answer', enumValues: ANSWERS})

//questionCategory declarations
declareVirtualField({model: 'questionCategory', field: 'questions', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'question' }
  }
})
declareEnumField( {model: 'questionCategory', field: 'value', enumValues: QUESTION_CATEGORIES})

//Gain declarations
declareEnumField( {model: 'gain', field: 'source', enumValues: COIN_SOURCES})

//Pack && purchase status declarations
declareEnumField( {model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})




// Ensure all expertise categories are defined
const ensureExpertiseCategories = () => {
  return Promise.all(Object.entries(EXPERTISE_CATEGORIES).map(([value,name]) => {
    return ExpertiseCategory.findOneAndUpdate(
      {value}, 
      {value,name},
      {upsert: true}
    )
  }))
}

ensureExpertiseCategories()

// Ensure all question categories are defined
const ensureQuestionCategories = () => {
  return Promise.all(Object.entries(QUESTION_CATEGORIES).map(([value,name]) => {
    return QuestionCategory.findOneAndUpdate(
      {value}, 
      {value,name},
      {upsert: true}
    )
  }))
}

ensureQuestionCategories()

// Ensure all coin gains are defined
const ensureGains = () => {
  return Promise.all(Object.entries(COIN_SOURCES).map(([source,name]) => {
    return Gain.findOneAndUpdate(
      {source}, 
      {source,name},
      {upsert: true}
    )
  }))
}

ensureGains()


const preprocessGet = async ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  //if id is defined it is a get for a group, else it is for homepage posts
  if (model==`post`) {
    if (!id) {
      params['filter.group'] = null
    } else {
      params.filter = {group: id}
    }
  }

  if (model == 'conversation') {
    if (id) {
      if(idEqual(id, user._id)) {
        console.log(user._id, id)
        id=undefined
      }
      else{
        let conv = await Conversation.findOne({ users: {$all: [user._id, id]}})
        if (!conv) {
          conv = await Conversation.create({ users : [user._id, id]})
        }
        id=conv._id
      }
    }
  }
  return Promise.resolve({model, fields, id, user, params})
}

setPreprocessGet(preprocessGet)

const preCreate = async ({model, params, user}) => {
  params.creator = params.creator || user._id

  if(model == `comment`) {
    if (!params.parent) {
      throw new BadRequestError(`Le parent est obligatoire`)
    }
    const model = await getModel(params.parent, [`post`,`content`])
    if (model == `post`) {
      params.post = params.parent
    }
    else {
      params.content = params.parent
    }
  }

  if (model == `group`) {
    if (user.role != ROLE_PARTNER) {
      if (user.role != ROLE_ADMIN) {
        throw new BadRequestError(`Seul un admin ou un partner peut créer une sous-ligue`)
      }
    } else {
      const company =await Company.findById(user.company);
      if (!lodash.some(company.administrators, (id) => idEqual(id, user._id) )) {
        throw new BadRequestError(`Il faut être admin de son entreprise pour créer une sous-ligue`)
      }
    }
    params.admin = user._id
    params.users = [user._id]
  }


  if (model== `company`) {
    if (params.is_partner===undefined) { params.is_partner = user.role==ROLE_ADMIN}
  }

  if (['message'].includes(model)) {
    params.sender = user._id
    const conversation = await Conversation.findById(params.parent)
    // A VOIR BATISTE
    params.conversation = params.parent
    params.receiver = await conversation.getPartner(user._id)
  }

  if(model === 'post') {
    if (params.parent) {
      const parentModel = await getModel(params.parent, ['group','user']);
      if (parentModel === 'group') {
        params.group = params.parent;
      } //if parent's model is user then it is a general feed post
    } else {
      params.group = null;
    }
  } 

  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postCreate = async ({ model, params, data, user }) => {
  if (model == `customerSuccess`) {
    await Company.findByIdAndUpdate(params.parent, {$push: {customer_successes: data._id}})
  }

  if (model == `certification`) {
    const model = await getModel(params.parent, [`company`,`user`])
    await mongoose.models[model].findByIdAndUpdate(params.parent, {$push: {certifications: data._id}})
  }

  if ([`user`,`content`,`company`,`group`,`event`].includes(model)) {
    data.expertise_set = await ExpertiseSet.create({})
    await data.save()
  }

  if (model == 'score') {
    const booleanField = booleanLevelFieldName(data.level)
    const questions = await Question.find({[booleanField]: true})
    const answers=await Promise.all(questions.map(async q => {
      return Answer.create({score: data._id, question: q._id})
    }))
    await mongoose.models[model].findByIdAndUpdate(data._id, {answers})
  }

  return data
}

setPostCreateData(postCreate)

const postPutData = async ({model, id, params, user}) => {
  if (model == `group`) {
    if (`users` in params) {
      await Group.updateOne({_id:id}, {$pull: {pending_users: params.users}})
    }
  }

  if (model == 'score' && params.is_drafted) {
    const computedScores = computeScores(params.answers)
    params = {...params, ...computedScores}
  }
  return {model, id, params, user}
}

setPostPutData(postPutData)

module.exports = {
  ensureExpertiseCategories,
  ensureQuestionCategories,
  testOnlyPostCreate: postCreate //for score.test.js
}