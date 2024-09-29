const mongoose = require('mongoose')
const { schemaOptions } = require('../utils/schemas')


const Schema = mongoose.Schema

const ChartDataSchema = new Schema({
  labels: [String],
  series: [{
    name: String,
    values: [{
      label: String,
      x: Number,
      y: Number,
    }]
  }]
}, schemaOptions  )

module.exports = ChartDataSchema
