const mongoose = require('mongoose')
const { isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')
const { ROLES, DEACTIVATION_REASON } = require('../consts')
const { getCurrentMissions, getComingMissions } = require('../missions')
const AddressSchema = require('../../../models/AddressSchema')

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
  email_valid: {
    type: Boolean,
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
  company_logo: {
    type: String,
    required: false,
  },
  company_name: {
    type: String,
    required: false
  },
  address: {
    type: AddressSchema,
    required: false,
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
// Required for register validation only
UserSchema.virtual('password2', DUMMY_REF).get(function() {})

UserSchema.virtual('pinned_freelances', {
  ref: 'customerFreelance',
  localField: '_id',
  foreignField: 'pinned_by',
})

UserSchema.virtual('current_missions', DUMMY_REF).get(function() {getCurrentMissions(this)})

UserSchema.virtual('coming_missions', DUMMY_REF).get(function() {getComingMissions(this)})

UserSchema.virtual('fullname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname}`
})

UserSchema.virtual('shortname', DUMMY_REF).get(function() {
  return `${this.firstname} ${this.lastname?.[0]}`
})

UserSchema.virtual('conversations', {
  ref: 'conversation',
  localField: '_id',
  foreignField: 'users'
})
UserSchema.virtual('conversations_count', {
  ref: 'conversation',
  localField: '_id',
  foreignField: 'users',
  count: true
})
/* eslint-enable prefer-arrow-callback */

module.exports = UserSchema
