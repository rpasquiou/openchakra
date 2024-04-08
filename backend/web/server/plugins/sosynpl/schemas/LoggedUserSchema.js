const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const CustomerSchema=require('./CustomerSchema')
const FreelanceSchema=require('./FreelanceSchema')
const AdminSchema=require('./AdminSchema')

// LoggedUser is a "simili" schema that returns all attributes for all roles (Custromer, Freelance, Admin)

const LoggedUserSchema = new Schema({
  ...CustomerSchema.paths, ...FreelanceSchema.paths, ...AdminSchema.paths,
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = LoggedUserSchema
