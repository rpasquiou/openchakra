const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const { isEmailOk } = require("../../../../utils/sms")
const { ROLES } = require("../consts")
const { schemaOptions } = require("../../../utils/schemas")

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
  role: {
    type: String,
    enum: Object.keys(ROLES),
    required: [true, 'Le rôle est obligatoire'],
  },
  statistics: {
    type: Schema.Types.ObjectId,
    ref: 'program',
    required: false,
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = UserSchema
