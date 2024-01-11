const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE}=require('../consts')

const ResourceSchema = new Schema({
  shortName: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: [true, `l'url est obligatoire`]
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le créateur est obligatoire'],
  },
  _evaluation: {
    type: Boolean,
    required: false,
  },
  optional: {
    type: Boolean,
    default: false,
    required: [true, `Le caractère optionnel est obligatoire`],
  },
  _resource_type: {
    type: String,
    enum: Object.keys(RESOURCE_TYPE),
    required: [true, `Le type de ressource est obligatoire`],
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
