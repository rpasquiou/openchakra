const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')

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
  optional: {
    type: Boolean,
    default: null,
    required: false,
  },
  mine: {
    type: Boolean,
  },
  // Correction par le formateur
  correction: {
    type: String,
    required: false,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = ResourceSchema
