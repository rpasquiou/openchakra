const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')

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
  evaluation: {
    type: Boolean,
    required: false,
  },
  optional: {
    type: Boolean,
    default: false,
    required: [true, `Le caractère optionnel est obligatoire`],
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ResourceSchema.virtual('resourceType').get(function(){
  return null
})

module.exports = ResourceSchema
