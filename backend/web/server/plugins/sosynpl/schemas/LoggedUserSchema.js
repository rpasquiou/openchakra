const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const UserSchema=require('./UserSchema')
const CustomerFreelanceSchema=require('./CustomerFreelanceSchema')
const AdminSchema=require('./AdminSchema')
const { ALL_LOCATIONS } = require('../../../../utils/consts')

// LoggedUser is a "simili" schema that returns all attributes for all roles (Custromer, Freelance, Admin)

const allAttributes={
  ...UserSchema.obj, ...CustomerFreelanceSchema.obj, ...AdminSchema.obj,
  ...UserSchema.virtuals, ...CustomerFreelanceSchema.virtuals, ...AdminSchema.virtuals,
}

const LoggedUserSchema = new Schema({
  ...allAttributes,
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = LoggedUserSchema
