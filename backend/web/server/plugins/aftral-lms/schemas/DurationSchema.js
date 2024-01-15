const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE}=require('../consts')

const DurationSchema = new Schema({
  block: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },

}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = DurationSchema
