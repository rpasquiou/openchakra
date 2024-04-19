const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const UserSchema=require('./UserSchema')
const CustomerSchema=require('./CustomerSchema')
const FreelanceSchema=require('./FreelanceSchema')
const AdminSchema=require('./AdminSchema')
const { ALL_LOCATIONS } = require('../../../../utils/consts')

// LoggedUser is a "simili" schema that returns all attributes for all roles (Custromer, Freelance, Admin)

const allAttributes={
  ...UserSchema.obj, ...CustomerSchema.obj, ...FreelanceSchema.obj, ...AdminSchema.obj,
  ...UserSchema.virtuals, ...CustomerSchema.virtuals, ...FreelanceSchema.virtuals, ...AdminSchema.virtuals,
}

const LoggedUserSchema = new Schema({
  ...allAttributes,
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = LoggedUserSchema
