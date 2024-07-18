const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE, BLOCK_STATUS}=require('../consts')

const ProgressSchema = new Schema({
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
  // TIme spent on resource in seconds
  spent_time: {
    type: Number,
  },
  annotation: {
    type: String,
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = ProgressSchema
