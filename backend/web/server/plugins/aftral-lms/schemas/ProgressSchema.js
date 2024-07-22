const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, BLOCK_STATUS}=require('../consts')

const ProgressSchema = new Schema({
  block: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required: [true, `Le bloc est obligatoire`],
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'apprenant est obligatoire`],
    index: true,
  },
  // TIme spent on resource in seconds
  spent_time: {
    type: Number,
  },
  annotation: {
    type: String,
  },
  achievement_status: {
    type: String,
    enum: Object.keys(BLOCK_STATUS),
    index: true,
  },
  consult: {
    type: Boolean
  },
  success: {
    type: Boolean,
  },
  finished: {
    type: Boolean,
  },
  consult_partial: {
    type: Boolean
  },
  consult_full: {
    type: Boolean
  },
  join_partial: {
    type: Boolean
  },
  join_full: {
    type: Boolean
  },
  download: {
    type: Boolean
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = ProgressSchema
