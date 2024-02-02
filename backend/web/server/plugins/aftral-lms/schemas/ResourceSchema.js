const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE}=require('../consts')

const ResourceSchema = new Schema({
  shortName: {
    type: String,
    required: false,
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
  mine: {
    type: Boolean,
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ResourceSchema.virtual('evaluation').get(function(value) {
  return this._evaluation
})

ResourceSchema.virtual('evaluation').set(function(value) {
  this._evaluation=value
})

module.exports = ResourceSchema
