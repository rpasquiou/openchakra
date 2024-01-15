const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE}=require('../consts')

const DurationSchema = new Schema({
  duration: {
    type: Number,
    required: true,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ResourceSchema.virtual('resource_type').get(function() {
  return this._resource_type
})

ResourceSchema.virtual('resource_type').set(function(value) {
  this._resource_type=value
})

ResourceSchema.virtual('evaluation').get(function(value) {
  return this._evaluation
})

ResourceSchema.virtual('evaluation').set(function(value) {
  this._evaluation=value
})

module.exports = ResourceSchema
