const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')

const Schema = mongoose.Schema

const MeasureSchema = new Schema({
  date: {
    type: Date,
    default: () => Date.now(),
    required: [true, 'La date est obligatoire']
  },
  customers_count: {
    type: Number,
    required: [true, 'le nombre de clients est obligatoire']
  },
  freelance_count: {
    type: Number,
    required: [true, 'le nombre de freelance est obligatoire']
  }
}, {...schemaOptions})

module.exports = MeasureSchema