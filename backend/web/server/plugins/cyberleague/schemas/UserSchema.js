const mongoose = require('mongoose')
const { isEmailOk, isPhoneOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF, idEqual } = require('../../../utils/database')
const { ROLES , JOBS, DISCRIMINATOR_KEY, JOB_STUDENT, LEVEL_THRESHOLD_EXPLORER, USER_LEVEL_CURIOUS, LEVEL_THRESHOLD_AMBASSADOR, USER_LEVEL_AMBASSADOR, USER_LEVEL_EXPLORER } = require('../consts')
const AddressSchema = require('../../../models/AddressSchema')
const { CREATED_AT_ATTRIBUTE } = require('../../../../utils/consts')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  role: {
    type: String,
    enum: Object.keys(ROLES),
    required: [true, `Le rôle est obligatoire`],
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
  company_size: {
    type: String,
    required: false,
  },
  company_sector: {
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
    required: false
  },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'school',
    required: false,
    validate:  [function(s) {s => !s || this.job == JOB_STUDENT}, 'Seul·e un·e étudiant·e peut avoir une école']
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
  registered_events: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'event',
      index: true,
      required: false,
    }],
    default: []
  },
  related_users: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user'
    }]
  },
  tokens: {
    type: Number,
    default: 0
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
    match: {completed: true},
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

/* eslint-enable prefer-arrow-callback */

module.exports = UserSchema
