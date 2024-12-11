const mongoose = require("mongoose")
const moment = require("moment")
const bcrypt = require('bcryptjs')
const { isEmailOk } = require("../../../../utils/sms")
const { ROLES, ROLE_APPRENANT } = require("../consts")
const { schemaOptions } = require("../../../utils/schemas")
const { DUMMY_REF } = require("../../../utils/database")

const Schema = mongoose.Schema

const UserSchema = new Schema({
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
    required: [true, 'L\'email est obligatoire'],
    set: v => v ? v.toLowerCase().trim() : v,
    validate: [isEmailOk, "L'email est invalide"],
    index: true,
    unique: true,
  },
  picture: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    set: pass => pass ? bcrypt.hashSync(pass, 10) : null,
  },
  plain_password: {
    type: String,
    required: [function() {this.role==ROLE_APPRENANT}, 'Le mot de passe est obligatoire'],
  },
  role: {
    type: String,
    enum: Object.keys(ROLES),
    required: [true, 'Le rôle est obligatoire'],
  },
  statistics: {
    type: Schema.Types.ObjectId,
    ref: 'program',
    required: false,
  },
  // Trainee current resources (i.e. achievment status==BLOCK_STATUS_CURRENT)
  current_resources: [{
    type: Schema.Types.ObjectId,
    ref: 'resource',
  }],
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'permission'
  }],
  permission_groups: [{
    type: Schema.Types.ObjectId,
    ref: 'permissionGroup'
  }],
  // AFTRAL identifer for both trainees & trainers
  aftral_id: {
    type: Number,
    required: false,
    index: true,
  },
  visios: [{
    type: Schema.Types.ObjectId,
    ref: 'visioDay',
  }],
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

UserSchema.virtual('fullname', DUMMY_REF).get(function() {
  return `${this.firstname || ''} ${this.lastname || ''}`
})

UserSchema.virtual('tickets', {
  ref: 'ticket',
  localField: '_id',
  foreignField: 'user',
})

UserSchema.virtual('tickets_count', {
  ref: 'ticket',
  localField: '_id',
  foreignField: 'user',
  count: true,
})

UserSchema.virtual('sessions', {
  ref: 'session',
  localField: '_id',
  foreignField: 'trainees',
  // Finally show all sessions
  // options: {
  //   match: () => ({
  //     start_date: {$lt: Date.now()},
  //     end_date: {$gte: Date.now()},
  //   })
  // }
})

UserSchema.index(
  { email: 1},
  { unique: true, message: 'Email dupliqué' });

  // Pre-validate hook to ensure unique email
UserSchema.pre('validate', async function (next) {
  const user = this
  const existingUser = await mongoose.models.user.findOne({ email: user.email });
  
  if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    user.invalidate('email', 'Email dupliqué');
    next(new Error('Email dupliqué'));
  } 
  else {
    next()
  }
})
/* eslint-enable prefer-arrow-callback */

module.exports = UserSchema
