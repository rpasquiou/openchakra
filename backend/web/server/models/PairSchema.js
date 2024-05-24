const mongoose = require('mongoose')
const { schemaOptions } = require('../utils/schemas')

const Schema = mongoose.Schema

const PairSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  value: {
    type: Number,
    required: [true, 'La valeur 1 est obligatoire'],
  },
  percent: {
    type: Number,
    required: [false],
  }
}, schemaOptions)

module.exports = PairSchema
