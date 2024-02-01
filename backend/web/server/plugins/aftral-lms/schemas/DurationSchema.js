const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE, BLOCK_STATUS}=require('../consts')

const DurationSchema = new Schema({
  block: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required: [true, `Le bloc est obligatoire`],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'apprenant est obligatoire`],
  },
  duration: {
    type: Number,
    default: 0,
    required: [true, `La durée est obligatoire`],
  },
  status: {
    type: String,
    enum: Object.keys(BLOCK_STATUS),
    required: [true, `Le statut est obligatoire`],
  },
  finished_resources_count: {
    type: Number,
    default: 0,
    required: [true, `Le nombre de ressources terminées est obligatoire`],
  },
  // Progress between 0 and 1
  progress: {
    type: Number,
    min: [0, 'Progress is between 0.0 and 1.0'],
    max: [1, 'Progress is between 0.0 and 1.0'],
    default: 0,
    required: [true, `La progression est obligatoire`],
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = DurationSchema
