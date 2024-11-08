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
    default: 0,
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
  join_partial: {
    type: Boolean
  },
  join_full: {
    type: Boolean
  },
  download: {
    type: Boolean
  },
  note: {
    type: Number,
  },
  attempts_count: {
    type: Number,
    required: true,
    default: 0,
  },
  scorm_data: {
    type: String
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ProgressSchema.virtual('homeworks', {
  ref: 'homework',
  localField: 'block',
  foreignField: 'resource',
})

module.exports = ProgressSchema
