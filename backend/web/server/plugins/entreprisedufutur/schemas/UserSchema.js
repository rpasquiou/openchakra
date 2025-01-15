const mongoose = require('mongoose')
const lodash = require('lodash')
const { isEmailOk, isPhoneOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF, idEqual } = require('../../../utils/database')
const { ROLES , JOBS, DISCRIMINATOR_KEY, LEVEL_THRESHOLD_EXPLORER, USER_LEVEL_CURIOUS, LEVEL_THRESHOLD_AMBASSADOR, USER_LEVEL_AMBASSADOR, USER_LEVEL_EXPLORER, COMPLETED_YES, OPTIONAL_COMPLETION_FIELDS, REQUIRED_COMPLETION_FIELDS, ROLE_MEMBER, BOOLEAN_ENUM_NO, BOOLEAN_ENUM, BOOLEAN_ENUM_YES, USER_GENRES } = require('../consts')
const AddressSchema = require('../../../models/AddressSchema')
const { CREATED_AT_ATTRIBUTE } = require('../../../../utils/consts')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  role: {
    type: String,
    enum: Object.keys(ROLES),
    required: [true, `Le rôle est obligatoire`],
    default: ROLE_MEMBER,
    index: true,
  },
  firstname: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le prénom est obligatoire'],
  },
  lastname: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le nom de famille est obligatoire'],
    index: true
  },
  email: {
    type: String,
    required: [true, `L'email est obligatoire`],
    set: v => v ? v.toLowerCase().trim() : v,
    index: true,
    validate: [isEmailOk, v => `L'email '${v.value}' est invalide`],
  },
  password: {
    type: String,
    required: [true, `Le mot de passe est obligatoire`],
    set: pass => pass ? bcrypt.hashSync(pass, 10) : null,
  },
  description: {
    type: String,
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
    set: v => v?.replace(/^0/, '+33'),
    required: false,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    index: true,
    required: false,
  },
  events: {
    //computed
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'event',
      index: true,
      required: false,
    }],
    default: []
  },
  pinned_by: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      index: true,
      required: true,
    }],
    default: []
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  trophies: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'gift',
      required: false
    }],
    default: []
  },
  function: {
    type: String,
    required: false
  },
  job: {
    type: String,
    enum: Object.keys(JOBS),
    required: false,
    set: v => v || undefined,
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'school',
    required: false
  },
  city: {
    type: AddressSchema,
    required: false
  },
  current_cursus: {
    type: String,
    required: false
  },
  searched_job: {
    type: String,
    required: false
  },
  looking_for_opportunities: {
    type: Boolean,
    required: false
  },
  certifications: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'certification',
      required: true,
    }],
    default: []
  },
  member_count: {
    type: Number,
    default: 0
  },
  partner_count: {
    type: Number,
    default: 0
  },
  user_count: {
    type: Number,
    default: 0
  },
  expertise_set: {
    type: Schema.Types.ObjectId,
    ref: 'expertiseSet',
  },
  users_looking_for_opportunities: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
  }],
  related_users: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }]
  },
  tokens: {
    type: Number,
    default: 1,
    required: true
  },
  company_sponsorship: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false
  },
  desactivation_reason: {
    type: String,
    required: false
  },
  unseen_notifications: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'notification'
    }]
  },
  unseen_notifications_count: {
    type: Number
  },
  seen_notifications: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'notification'
    }]
  },
  seen_notifications_count: {
    type: Number
  },
  is_allergic: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: true,
    default: BOOLEAN_ENUM_NO
  },
  allergy: {
    type: String,
    required: [function () {this.is_allergic == BOOLEAN_ENUM_YES},`Les allergies doivent être renseignées pour les personnes allergiques`],
  },
  genre: {
    type: String,
    enum: Object.keys(USER_GENRES),
    required: false
  },
  is_comex_member: {
    type: Boolean,
    required: true,
    default: false,
  },
  reset_token: {
    type: Schema.Types.ObjectId,
    ref: 'resetToken',
    required: false,
  },
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */
UserSchema.virtual('password2', DUMMY_REF).get(function() {})

UserSchema.virtual('fullname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname}`
})

UserSchema.virtual('shortname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname?.[0]}.`
})

UserSchema.virtual('pinned_by_count', DUMMY_REF).get(function() {
  return this.pinned_by?.length || 0
})

UserSchema.virtual('pinned_users', {
  ref:'user',
  localField:'_id',
  foreignField:'pinned_by',
})

UserSchema.virtual('pinned_companies', {
  ref:'company',
  localField:'_id',
  foreignField:'pinned_by',
})

UserSchema.virtual('pinned_companies_count', {
  ref:'company',
  localField:'_id',
  foreignField:'pinned_by',
  count:true,
})

UserSchema.virtual('groups', {
  ref:'group',
  localField:'_id',
  foreignField:'users',
})

UserSchema.virtual('groups_count', {
  ref:'group',
  localField:'_id',
  foreignField:'users',
  count:true,
})

UserSchema.virtual('groups_admin', {
  ref:'group',
  localField:'_id',
  foreignField:'admin',
})

UserSchema.virtual('pending_groups', {
  ref:'group',
  localField:'_id',
  foreignField:'pending_users',
})

UserSchema.virtual('pending_groups_count', {
  ref:'group',
  localField:'_id',
  foreignField:'pendgin_users',
  count:true,
})

UserSchema.virtual('communications', {
  ref: 'communication',
  localField: '_id',
  foreignField: 'creator',
})

UserSchema.virtual('experiences', {
  ref: 'experience',
  localField: '_id',
  foreignField: 'creator',
})

UserSchema.virtual('trainings', {
  ref: 'training',
  localField: '_id',
  foreignField: 'creator',
})

UserSchema.virtual('is_company_admin', DUMMY_REF).get(function() {
  return this.company?.administrators?.some(admin => idEqual(admin._id,this._id))
})

UserSchema.virtual('companies', DUMMY_REF).get(function() {
  return this.company ? [this.company] : []
})

UserSchema.virtual('completed_scores', {
  ref:'score',
  localField:'_id',
  foreignField:'creator',
  options: {
    match: {completed: COMPLETED_YES},
  },
})

UserSchema.virtual('latest_score', {
  ref: 'score',
  localField: '_id',
  foreignField: 'creator',
  options: { 
    sort: { [CREATED_AT_ATTRIBUTE]: -1 }, 
    limit: 1,
  },
})

UserSchema.virtual('posts', {
  ref: 'post',
  localField: '_id',
  foreignField: 'creator',
})

UserSchema.virtual('comments', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'creator',
})

UserSchema.virtual('level', DUMMY_REF).get(function() {
  if (this.tokens < LEVEL_THRESHOLD_EXPLORER) {
    return USER_LEVEL_CURIOUS
  }
  if (this.tokens >= LEVEL_THRESHOLD_AMBASSADOR) {
    return USER_LEVEL_AMBASSADOR
  }
  return USER_LEVEL_EXPLORER
})

UserSchema.virtual('carreer_applications', {
  ref:'carreer',
  localField:'_id',
  foreignField:'candidates',
})

UserSchema.virtual('published_missions', {
  ref:'mission',
  localField:'_id',
  foreignField:'creator',
})

UserSchema.virtual('published_missions_count', {
  ref:'mission',
  localField:'_id',
  foreignField:'creator',
  count: true
})

UserSchema.virtual('published_public_missions', {
  ref:'mission',
  localField:'_id',
  foreignField:'creator',
  options: {
    match: {is_public: true}
  }
})

UserSchema.virtual('published_public_missions_count', {
  ref:'mission',
  localField:'_id',
  foreignField:'creator',
  options: {
    match: {is_public: true}
  },
  count: true
})

UserSchema.virtual('profil_completion', DUMMY_REF).get(function() {
  const requiredCompletionFields = lodash.map(REQUIRED_COMPLETION_FIELDS, (_,key) => {
    return this[key]
  }).filter((e) => !lodash.isNil(e))

  const optionalCompletionFields = lodash.map(OPTIONAL_COMPLETION_FIELDS, (_,key) => {
    return this[key]
  }).filter((e) => !lodash.isNil(e))

  return (31 + requiredCompletionFields.length * 15 + optionalCompletionFields.length * 3)/100
})

UserSchema.virtual('missing_attributes', DUMMY_REF).get(function() {
  const completionFields = lodash.concat(
    lodash.map(REQUIRED_COMPLETION_FIELDS, (v,key) => {return [key, this[key],v]}),
    lodash.map(OPTIONAL_COMPLETION_FIELDS, (v,key) => {return [key, this[key],v]})
  )

  const missingFields = lodash.filter(completionFields, (e)=> {return !e[1]})
  const s = missingFields.length > 1 ? 's' : ''

  return `Information${s} manquante${s} : ` + missingFields.map((e)=> {return e[2]}).join(`, `)
})

UserSchema.virtual('search_text',DUMMY_REF)

/* eslint-enable prefer-arrow-callback */

module.exports = UserSchema