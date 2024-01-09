const mongoose = require("mongoose")
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
  role: {
    type: String,
    enum: Object.keys(ROLES),
    required: [true, 'Le rôle est obligatoire'],
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = UserSchema
