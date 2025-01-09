const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { COIN_SOURCES } = require('../consts')

const Schema = mongoose.Schema

const GainSchema = new Schema({
  source: {
    type: String,
    enum: Object.keys(COIN_SOURCES),
    required: [true, "La source de jetons est obligatoire"],
  },
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  description: {
    type: String,
    required: false,
  },
  gain: {
    type: Number,
    default: 0
  }
}, schemaOptions)

module.exports = GainSchema