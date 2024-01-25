const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE, BLOCK_STATUS}=require('../consts')

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
    default: 0,
    required: true,
  },
  status: {
    type: String,
    enum: Object.keys(BLOCK_STATUS),
    required: false,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = DurationSchema
