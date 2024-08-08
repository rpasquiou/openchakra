const mongoose = require('mongoose')
const { isEmailOk, isPhoneOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')
const { ROLES , JOBS } = require('../consts')

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
  expertises: [{
    type: Schema.Types.ObjectId,
    ref: 'expertise',
    index: true,
    required: false,
  }],
  events: [{
    type: Schema.Types.ObjectId,
    ref: 'events',
    index: true,
    required: false,
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    index: true,
    required: false,
  }],
  trophies: [{
    type: Schema.Types.ObjectId,
    ref: 'gift',
    required: false
  }],
  function: {
    type: String,
    required: false
  },
  job: {
    type: String,
    enum: Object.keys(JOBS),
    required: false
  }
  }, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
UserSchema.virtual('password2', DUMMY_REF).get(function() {})

UserSchema.virtual('fullname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname}`
})

UserSchema.virtual('shortname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname[0]}.`
})

UserSchema.virtual('followers_count', DUMMY_REF).get(function() {
  return this.followers?.length || 0
})

UserSchema.virtual('users_following', {
  ref:'user',
  localField:'_id',
  foreignField:'followed_by',
})

UserSchema.virtual('users_following_count', {
  ref:'user',
  localField:'_id',
  foreignField:'followed_by',
  count: true,
})

UserSchema.virtual('companies_following', {
  ref:'company',
  localField:'_id',
  foreignField:'followed_by',
})

UserSchema.virtual('companies_following_count', {
  ref:'company',
  localField:'_id',
  foreignField:'followed_by',
  count:true,
})

/* eslint-disable prefer-arrow-callback */

module.exports = UserSchema
