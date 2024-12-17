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
  finished_resources_count: {
    type: Number,
    default: 0,
    required: true,
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
  // Stores generated certificate for trainee/session
  certificate_url: {
    type: String,
    required: false,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ProgressSchema.index({ block: 1, user: 1 }, {unique: true})

ProgressSchema.virtual('homeworks', {
  ref: 'homework',
  localField: 'block',
  foreignField: 'resource',
})

ProgressSchema.index({ block: 1, user: 1 }, { unique: true })

module.exports = ProgressSchema
