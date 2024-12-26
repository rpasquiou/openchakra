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
  loadFromDb,
  setPrePutData,
  setPreDeleteData,
} = require('../../utils/database')
const { ROLES, SECTOR, EXPERTISE_CATEGORIES, CONTENT_TYPE, JOBS, COMPANY_SIZES, ROLE_PARTNER, ROLE_ADMIN, ROLE_MEMBER, ESTIMATED_DURATION_UNITS, LOOKING_FOR_MISSION, CONTENT_VISIBILITY, EVENT_VISIBILITY, ANSWERS, QUESTION_CATEGORIES, SCORE_LEVELS, COIN_SOURCES, STATUTS, GROUP_VISIBILITY, USER_LEVELS, CONTRACT_TYPES, WORK_DURATIONS, PAY, STATUT_SPONSOR, STATUT_FOUNDER, STATUSES, STATUT_PARTNER, COMPLETED, OFFER_VISIBILITY, MISSION_VISIBILITY, COIN_SOURCE_LIKE_COMMENT, COMPLETED_YES, COIN_SOURCE_PARTICIPATE, REQUIRED_COMPLETION_FIELDS, OPTIONAL_COMPLETION_FIELDS, ENOUGH_SCORES, NOTIFICATION_TYPES, NOTIFICATION_TYPE_MESSAGE, NOTIFICATION_TYPE_FEED_COMMENT, NOTIFICATION_TYPE_FEED_LIKE, NOTIFICATION_TYPE_GROUP_COMMENT, NOTIFICATION_TYPE_GROUP_LIKE, BOOLEAN_ENUM, EVENT_AVAILABILITIES, BIOGRAPHY_STATUSES, USERTICKET_STATUSES, ACCOMODATION_TYPES, TIMEZONES, PARTNER_LEVELS, COMPANY_TURNOVERS, STATUT_MEMBER, ORDER_STATUSES, COMPANY_TYPES, USER_GENRES, COMPANY_CAPITALS, EVENT_STATUSES, EVENT_STATUS_PAST } = require('./consts')
const { PURCHASE_STATUS, REGIONS } = require('../../../utils/consts')
const Company = require('../../models/Company')
const { BadRequestError, ForbiddenError } = require('../../utils/errors')
const { getterPinnedFn, setterPinnedFn } = require('../../utils/pinned')
const Group = require('../../models/Group')
const { getterCountFn } = require('./count')
const { getContents, getterStatus } = require('./company')
const ExpertiseSet = require('../../models/ExpertiseSet')
const QuestionCategory = require('../../models/QuestionCategory')
const { isMineForMessage } = require('./message')
const { getConversationPartner } = require('./conversation')
const ExpertiseCategory = require('../../models/ExpertiseCategory')
const { getQuestionsByCategory, computeScoresIfRequired, getCategoryRates, updateMarketScore, getChartData, getAnswerIndex } = require('./score')
const Conversation = require('../../models/Conversation')
const Score = require('../../models/Score')
const Gain = require('../../models/Gain')
const { isMineForPost } = require('./post')
const { getRelated } = require('./related')
const { getLooking, getEvents } = require('./user')
const { computeBellwetherStatistics } = require('./statistic')
const User = require('../../models/User')
const Tablemap = require('../../models/Tablemap')
const { getPendingNotifications, getPendingNotificationsCount, setAllowedTypes, getSeenNotifications, getSeenNotificationsCount, setComputeUrl, setComputeMessage, callComputeMessage } = require('../notifications/functions')
const { deleteUserNotification, addNotification } = require('../notifications/actions')
const { computeUrl: ComputeDomain } = require('../../../config/config')
const { getTagUrl } = require('../../utils/mailing')
const { getterPartnerList } = require('./admin_dashboard')
const { getUnknownEmails, getInputsValid } = require('./order')
const AdminDashboard = require('../../models/AdminDashboard')
const { getRegistered, getRegisteredNumber } = require('./event')

//Notification plugin setup
setAllowedTypes(NOTIFICATION_TYPES)

const computeUrl = ({type, targetId}) => {
  let tagUrl
  switch (type) {
    case NOTIFICATION_TYPE_MESSAGE:
      tagUrl = getTagUrl('NOTIFICATION_MESSAGE')
      break
    case NOTIFICATION_TYPE_FEED_COMMENT:
    case NOTIFICATION_TYPE_FEED_LIKE:
    case NOTIFICATION_TYPE_GROUP_COMMENT:
    case NOTIFICATION_TYPE_GROUP_LIKE:
      tagUrl = getTagUrl('NOTIFICATION_POST')
      break;
  }

  if (!tagUrl) {
    throw new Error(`Unknown notification type ${type} in computeUrl`)
  }

  return `${ComputeDomain(tagUrl)}?id=${targetId}`
}
setComputeUrl(computeUrl)


const computeMessage = ({type, user, params}) => {
  switch (type) {
    case NOTIFICATION_TYPE_MESSAGE:
      return `${user.shortname} vous a envoyé un nouveau message`
    case NOTIFICATION_TYPE_FEED_COMMENT:
      return `${user.shortname} a commenté une de vos publications`
    case NOTIFICATION_TYPE_FEED_LIKE:
      return `${user.shortname} a aimé une de vos publications`
    case NOTIFICATION_TYPE_GROUP_COMMENT:
      return `${user.shortname} a commenté une de vos publications sur la ligue ${params.groupName}`
    case NOTIFICATION_TYPE_GROUP_LIKE:
      return `${user.shortname} a aimé une de vos publications sur la ligue ${params.groupName}`
  }
  throw new Error(`Unknown notification type ${type} in computeMessage`)
}
setComputeMessage(computeMessage)






//User declarations
const USER_MODELS = ['user', 'loggedUser', 'admin', 'partner', 'member']
USER_MODELS.forEach(m => {
  declareComputedField({model: m, field: 'users_looking_for_opportunities', getterFn: getLooking})
  
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
  declareVirtualField({
    model: m, field: 'groups_admin', instance: 'Array', multiple: true,
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
    model: m, field: 'completed_scores', instance: 'Array', multiple: true,
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
  declareVirtualField({model: m, field: 'level', requires: 'tokens', instance: 'String', enumValues: USER_LEVELS})
  declareComputedField({model: m, field: 'related_users',  requires:'function,company.size,company.sector,shortname', getterFn: getRelated('user')})
  declareVirtualField({model: m, field: 'carreer_applications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'carreer'}
    }
  })
  declareVirtualField({model: m, field: 'published_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'mission'}
    }
  })
  declareVirtualField({model: m, field: 'published_public_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'mission'}
    }
  })
  declareVirtualField({
    model: m,
    field: 'profil_completion',
    instance: 'Number',
    requires: lodash.join(lodash.concat(
      lodash.map(REQUIRED_COMPLETION_FIELDS, (_,key) => {return key}),
      lodash.map(OPTIONAL_COMPLETION_FIELDS, (_,key) => {return key})
    ),`,`)
  })
  declareVirtualField({
    model: m,
    field: 'missing_attributes',
    instance: 'String',
    requires: lodash.join(lodash.concat(
      lodash.map(REQUIRED_COMPLETION_FIELDS, (_,key) => {return key}),
      lodash.map(OPTIONAL_COMPLETION_FIELDS, (_,key) => {return key})
    ),`,`)
  })
  declareComputedField({model: m, field: 'seen_notifications', getterFn: getSeenNotifications})
  declareComputedField({model: m, field: 'seen_notifications_count', getterFn: getSeenNotificationsCount})
  declareComputedField({model: m, field: 'unseen_notifications', getterFn: getPendingNotifications})
  declareComputedField({model: m, field: 'unseen_notifications_count', getterFn: getPendingNotificationsCount})
  declareVirtualField({model: m, field: 'published_missions_count', instance: 'Number'})
  declareVirtualField({model: m, field: 'published_public_missions_count', instance: 'Number'})
  declareEnumField({model: m, field:'is_allergic', enumValues: BOOLEAN_ENUM})
  declareEnumField({model: m, field: 'genre', enumValues:USER_GENRES})
  declareComputedField({model:m, field: 'events', getterFn: getEvents})
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
declareVirtualField({ model: 'company', field: 'affected_missions', instance: 'Array', multiple: true,
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
declareEnumField( {model: 'company', field: 'size', enumValues: COMPANY_SIZES})
declareEnumField( {model: 'company', field: 'targeted_markets', enumValues: SECTOR})
declareEnumField( {model: 'company', field: 'looking_for_mission', enumValues: LOOKING_FOR_MISSION})
declareEnumField( {model: 'company', field: 'statut', enumValues: STATUTS})
declareComputedField({model: 'company', field: 'pinned', getterFn: getterPinnedFn('company', 'pinned_by'), setterFn: setterPinnedFn('company', 'pinned_by'), requires:'pinned_by'})
declareComputedField({model: 'company', field: 'contents',  requires:'users', getterFn: getContents})
declareComputedField({model: 'company', field: 'related_companies',  requires:'expertise_set.expertises', getterFn: getRelated('company')})
declareVirtualField({model: 'company', field: 'sponsored', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'user'}
  }
})
declareVirtualField({ model: 'company', field: 'carreers', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'carreer' }
  },
})
declareVirtualField({ model: 'company', field: 'offers', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'offer' }
  },
})
declareVirtualField({model: 'company', field: 'affected_missions_count', instance: 'Number'})
declareComputedField({model: 'company', field: 'sponsors', getterFn: getterStatus({field: 'statut', value: STATUT_SPONSOR})})
declareComputedField({model: 'company', field: 'founders', getterFn: getterStatus({field: 'statut', value: STATUT_FOUNDER})})
declareVirtualField({model: 'company', field: 'region', requires: 'city.region', instance: 'String', enumValues: REGIONS})
declareVirtualField({ model: 'company', field: 'candidates_missions', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'mission' }
  },
})
declareVirtualField({model: 'company', field: 'candidates_missions_count', instance: 'Number'})
declareVirtualField({model: 'company', field: 'is_partner', requires: 'statut', instance: 'Boolean'})
declareEnumField({model: 'company', field: 'turnover', enumValues: COMPANY_TURNOVERS})
declareEnumField({model: 'company', field: 'type', enumValues: COMPANY_TYPES})
declareEnumField({model: 'company', field: 'capital', enumValues: COMPANY_CAPITALS})

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
declareVirtualField({model: 'post', field: 'likes_count', ROLE: 'Number' })
declareVirtualField({model: 'post', field: 'comments', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'comment' }
  },})
declareComputedField({model: 'post', field: 'liked', getterFn: getterPinnedFn('post', 'liked_by'), setterFn: setterPinnedFn('post', 'liked_by'), requires:'liked_by'})
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
declareEnumField( {model: 'group', field: 'visibility', enumValues: GROUP_VISIBILITY})

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
declareEnumField({model: 'event', field: 'star_event', enumValues: BOOLEAN_ENUM})
declareEnumField({model: 'event', field: 'reservable_tickets', enumValues: BOOLEAN_ENUM})
declareEnumField({model: 'event', field: 'meal_included', enumValues: BOOLEAN_ENUM})
declareEnumField({model: 'event', field: 'tablemap_included', enumValues: BOOLEAN_ENUM})
declareEnumField({model: 'event', field: 'availability', enumValues: EVENT_AVAILABILITIES})
declareEnumField({model: 'event', field:'timezone', enumValues: TIMEZONES})
declareVirtualField({model: 'event', field: 'event_tickets', multiple: true, instance: 'Array', 
  caster: {
    instance: 'ObjectID',
    options: {ref: 'eventTicket'}
  }
})
declareVirtualField({model: 'event', field: 'posts', instance: 'Array', multiple: true, 
  caster: {
    instance: 'ObjectID',
    options: { ref: 'post' }
  },})
declareVirtualField({model: 'event', field: 'posts_count', instance: 'Number'})
declareVirtualField({model: 'event', field: 'status', requires: 'start_date', instance: 'String', enumValues: EVENT_STATUSES, 
  dbFilter: value => {return RegExp(value).test(EVENT_STATUS_PAST) ? {start_date: {$lt: Date.now()}} : {start_date: {$gt: Date.now()}}}
})
declareComputedField({model: 'event', field: 'registered_users', getterFn: getRegistered})
declareComputedField({model: 'event', field: 'registered_users_count', getterFn: getRegisteredNumber})

// Mission declaration
declareEnumField({model: 'mission', field: 'estimation_duration_unit', enumValues: ESTIMATED_DURATION_UNITS})
declareEnumField({model: 'mission', field: 'status', enumValues: STATUSES})
declareEnumField({model: 'mission', field: 'region', enumValues: REGIONS})
declareVirtualField({model: 'mission', field: 'visibility', requires: 'is_public', instance: 'String', enumValues: MISSION_VISIBILITY})
declareVirtualField({model: 'mission', field: 'candidates_count', instance: 'Number'})

// ExpertiseSet declarations
declareVirtualField({model: 'expertiseSet', field: 'display_categories', requires: 'expertises,categories', instance: 'Array', multiple: true})
declareEnumField({model: 'expertiseSet', field: 'main_expertise_category', enumValues: EXPERTISE_CATEGORIES})

//ExpertiseLevel declarations
declareVirtualField({model: 'expertiseLevel', field: 'expertise_level_STR', requires: 'expertise.name', instance: 'String'})

//Score declarations
declareVirtualField({model: 'score', field: 'deviation', requires: 'answers.answer', instance: 'Number'})
declareVirtualField({model: 'score', field: 'question_count', require: 'answers', instance: 'Number'})
declareEnumField( {model: 'score', field: 'level', enumValues: SCORE_LEVELS})
declareComputedField({model: 'score', field: 'questions_by_category', requires: 'answers.question.question_category._id', getterFn: getQuestionsByCategory})
declareComputedField({model: 'score', field: 'bellwether_count', requires:'completed', getterFn: getterCountFn('score', {'completed': COMPLETED_YES})})
declareComputedField({model: 'score', field: 'chart_data', getterFn: getChartData})
declareComputedField({model: 'score', field: 'category_rates', requires: '_category_rates.category.name,_category_rates.rate,_category_rates.category._id', getterFn: getCategoryRates})
declareEnumField({model: 'score', field: 'completed', enumValues: COMPLETED})

//Answer declaration
declareEnumField( {model: 'answer', field: 'answer', enumValues: ANSWERS})
declareComputedField({model: 'answer', field: 'index', getterFn: getAnswerIndex})

//Question declarations
declareEnumField( {model: 'question', field: 'min_level', enumValues: SCORE_LEVELS})

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

//Carreer declarations
declareEnumField({model: 'carreer', field: 'contract_type', enumValues: CONTRACT_TYPES})
declareEnumField({model: 'carreer', field: 'work_duration', enumValues: WORK_DURATIONS})
declareEnumField({model: 'carreer', field: 'pay', enumValues: PAY})
declareEnumField({model: 'carreer', field: 'status', enumValues: STATUSES})
declareVirtualField({model: 'carreer', field: 'candidates_count', requires: 'candidates', instance: 'Number'})

//biography declarations
declareEnumField({model: 'biography', field: 'status', enumValues:BIOGRAPHY_STATUSES})

//EventTicket declarations
declareEnumField({model: 'eventTicket', field: 'price_visibility', enumValues: BOOLEAN_ENUM})
declareEnumField({model: 'eventTicket', field: 'targeted_roles', multiple: true, enumValues: ROLES})
declareEnumField({model: 'eventTicket', field: 'visibility', enumValues: EVENT_VISIBILITY})
declareVirtualField({model: 'eventTicket', field: 'quantity_registered', instance: 'Number'})
declareVirtualField({model:'eventTicket', field: 'remaining_tickets', instance: 'Number', requires: 'quantity,quantity_registered'})

//UserTicket declarations
declareEnumField({model: 'userTicket', field: 'status', enumValues: USERTICKET_STATUSES})

//Offer declarations
declareEnumField({model: 'offer', field: 'visibility', enumValues: OFFER_VISIBILITY})
declareEnumField({model: 'offer', field: 'price_member_duration_unit', enumValues: ESTIMATED_DURATION_UNITS})

//Accomodation declaration
declareEnumField({model: 'accomodation', field: 'type',enumValues: ACCOMODATION_TYPES})

//Statistic declarations
declareEnumField({model: 'statistic', field: 'enoughScores', enumValues: ENOUGH_SCORES})

//Table declarations
declareEnumField({model: 'table', field: 'partner_level', enumValues: PARTNER_LEVELS})

//Tablemap declarations
declareVirtualField({model: 'tablemap', field: 'tables', multiple: true, instance: 'Array',
  caster: {
    instance: 'ObjectID',
    options: { ref: 'table' }
  }
})
declareVirtualField({model: 'tablemap', field: 'tables_count', instance: 'Number'})

//Admin_dashboard declaration
declareComputedField({model: 'adminDashboard', field: 'event_count', getterFn: getterCountFn('event')})
declareComputedField({model: 'adminDashboard', field: 'partner_list', getterFn: getterPartnerList})

//Order declarations
declareEnumField({model: 'order', field:'status', enumValues: ORDER_STATUSES})
declareVirtualField({model: 'order', field: 'order_tickets', multiple: true, instance: 'Array',
  caster: {
    instance: 'ObjectID',
    options: { ref: 'orderTicket' }
  }
})
declareVirtualField({model: 'order', field: 'order_tickets_count', instance: 'Number'})
declareComputedField({model: 'order', field: 'unknown_tickets', getterFn: getUnknownEmails})
declareComputedField({model: 'order', field: 'are_inputs_valid', getterFn: getInputsValid})

//OrderTicket declarations
declareEnumField({model: 'orderTicket', field: 'status', enumValues: USERTICKET_STATUSES})




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

//create score with market values
const ensureMarketScore = async () => {
  const _category_rates = null
  return updateMarketScore(_category_rates)
}

ensureMarketScore()

const ensureAdminDashboard = async () => {
  return AdminDashboard.findOneAndUpdate(
    {}, 
    {},
    {upsert: true}
  )
}

ensureAdminDashboard()

const preprocessGet = async ({model, fields, id, user, params}) => {
  //console.log('preGet : model', model, 'fields', fields, 'id', id, 'user', user, 'params', params)
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  //if id is defined it is a get for an event, else it is for homepage posts
  if (model==`post`) {
    if (!id) {
      params['filter.event'] = null
    } else {
      params.filter = {event: id}
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

  let data

  if (model == 'statistic') {
    data = await computeBellwetherStatistics(params)
  }

  return Promise.resolve({model, fields, id, user, params, data})
}

setPreprocessGet(preprocessGet)

const preCreate = async ({model, params, user}) => {
  //console.log('preCreate : model', model, 'user', user, 'params', params)
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
      const company =await Company.findById(user.company)
      if (!lodash.some(company.administrators, (id) => idEqual(id, user._id) )) {
        throw new BadRequestError(`Il faut être admin de son entreprise pour créer une sous-ligue`)
      }
    }
    params.admin = user._id
    params.users = [user._id]
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
      const parentModel = await getModel(params.parent, ['event','user'])
      if (parentModel === 'event') {
        params.event = params.parent
      } //if parent's model is user then it is a general feed post
    } else {
      params.group = null
    }
  }

  if (model == 'score') {
    throw new ForbiddenError(`Un score doit être créé via l'action start survey`)
  }

  if (model == 'expertiseCategory') {
    throw new ForbiddenError(`Il est impossible de créer une catégorie d'expertise`)
  }

  if (model == 'questionCategory') {
    throw new ForbiddenError(`Il est impossible de créer une catégorie de question`)
  }

  if (model == 'adminDashboard') {
    throw new ForbiddenError(`Il est impossible de créer un admin dashboard`)
  }

  if (model == 'gain') {
    throw new ForbiddenError(`Il est impossible de créer de nouvelles manières de gagner des jetons`)
  }

  if (model == 'table') {
    throw new ForbiddenError(`Une table doit être créée via l'action generate_tables`)
  }

  if (model == 'order') {
    throw new ForbiddenError(`Une commande doit être créée via l'action generate_order`)
  }

  if (model == 'carreer') {
    if (!user.company) {
      throw new BadRequestError(`Il faut faire partie d'une entreprise pour pouvoir créer un job`)
    }
    const [company]=await loadFromDb({model: 'company', id: user.company, fields:['statut']})
    if (company.statut == STATUT_MEMBER) {
      throw new BadRequestError(`Il faut faire partie d'une entreprise partenaire, sponsor ou fondatrice pour pouvoir créer un job`)
    }
    params.company = user.company
  }

  if (model == 'offer') {
    if (!user.company) {
      throw new BadRequestError(`Il faut faire partie d'une entreprise pour pouvoir créer une offre`)
    }
    const [company]=await loadFromDb({model: 'company', id: user.company, fields:['statut']})
    if (company.statut == STATUT_MEMBER || company.statut == STATUT_PARTNER) {
      throw new BadRequestError(`Il faut faire partie d'une entreprise sponsor ou fondatrice pour pouvoir créer une offre`)
    }
    params.company = user.company
  }

  if (model == 'mission') {
    if (params.parent) {
      params.company = params.parent
      params.is_public = true
    } else {
      if (!params.companies[0] && !params.is_public) {
        throw new Error(`Merci de renseigner une entreprise ou de rendre la mission publique avant d'envoyer votre demande`)
      }
    }
  }

  if (model == 'eventTicket') {
    if (!params.parent) {
      throw new Error(`Il faut mettre l'événement du ticket en parent`)
    }
    params.event = params.parent
  }

  if (model == 'attachment') {
    if (!params.parent) {
      throw new Error(`Il faut mettre l'événement de la PJ en parent`)
    }
    params.event = params.parent
  }

  let data = null

  return Promise.resolve({model, params, data})
}

setPreCreateData(preCreate)

const postCreate = async ({ model, params, data, user }) => {
  //console.log('postCreate : model', model, 'data', data, 'user', user, 'params', params)
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

  if (model == 'comment') {
    const gain = await Gain.findOne({source: COIN_SOURCE_LIKE_COMMENT})
    await User.findByIdAndUpdate(user._id, {$set: {tokens: user.tokens + gain.gain}})

    // if (data.post) {
    //   await addNotification({
    //     users: [data.creator],
    //     targetId: data._id,
    //     targetType: NOTIFICATION_TYPE_POST,
    //     text: 'text de notif',
    //     type: NOTIFICATION_TYPE_POST,
    //     customData: null,
    //     picture: null
    //   })
    // }
  }

  //Message notification
  if (model == 'message') {
    await addNotification({
      users: [params.receiver],
      targetId: user._id,
      targetType: NOTIFICATION_TYPES[NOTIFICATION_TYPE_MESSAGE],
      text: callComputeMessage({type: NOTIFICATION_TYPE_MESSAGE,user}),
      type: NOTIFICATION_TYPE_MESSAGE,
      customData: null,
      picture: user.picture
    })
  }

  if (model == 'event' && data.tablemap_included) {
    data.tablemap = await Tablemap.create({})
    await data.save()
  }

  return data
}

setPostCreateData(postCreate)


const postPutData = async ({model, id, user, attribute, value}) => {
  // console.log('postPut : model', model, 'id', id, 'user', user, 'attribute', attribute, 'value', value)
  if (model == `group`) {
    if (attribute == 'users') {
      await Group.updateOne({_id:id}, {$pull: {pending_users: value}})
    }
  }

  if (model == 'answer') {
    const score = await Score.findOne({answers: id})
    await computeScoresIfRequired(score._id)
  }

  if (model == 'post') {
    const gain = await Gain.findOne({source: COIN_SOURCE_LIKE_COMMENT})
    if (attribute == 'liked') {
      if (value) {
        await User.findByIdAndUpdate(user._id, {$set: {tokens: user.tokens + gain.gain }})
      } else {
        await User.findByIdAndUpdate(user._id, {$set: {tokens: user.tokens - gain.gain }})
      }
    }
  }

  if (model == 'event') {
    if (attribute == 'registered_users') {
      const gain = await Gain.findOne({source: COIN_SOURCE_PARTICIPATE})
      if (lodash.includes(value, user._id.toString())) {
        //console.log('registered')
        await User.findByIdAndUpdate(user._id, {$set: {tokens: user.tokens + gain.gain }})
      } else {
        //console.log('unregistered')
        await User.findByIdAndUpdate(user._id, {$set: {tokens: user.tokens - gain.gain }})
      }
    }
  }

  return {model, user, attribute, value}
}

setPostPutData(postPutData)


const prePutData = async ({model, id, params, user}) => {
  //console.log('prePut : model', model, 'id', id, 'user', user, 'params', params)

  if (model == 'company') {
    if (params.administrators) {
      params.administrators = params.administrators.split(',')
    }
  }

  return {model, id, params, user}
}

setPrePutData(prePutData)


const preDeleteData = async ({model, id, data, user}) => {
  let returnedData = null
  //deleteAction is forbidden except for notifications from notification plugin
  if (model == 'notification') {
    const notification = await deleteUserNotification(id,user)
    returnedData = notification.recipients ? null : notification
  } else {
    throw new ForbiddenError(`Pas de delete pour l'instant`)
  }
  return {model, id, data: returnedData, user, params: null}
}

setPreDeleteData(preDeleteData)


module.exports = {
  ensureExpertiseCategories,
  ensureQuestionCategories,
}