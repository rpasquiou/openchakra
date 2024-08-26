const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas')

const Schema = mongoose.Schema;

const StatisticSchema = new Schema({
  users_count: {
    type: Number,
    required: false,
  },
  freelances_count: {
    type: Number,
    required: false,
  },
  customers_count: {
    type: Number,
    required: false,
  },
  current_missions_count: {
    type: Number,
    required: false,
  },
  coming_missions_count: {
    type: Number,
    required: false,
  },
  registrations_statistic: [{
    type: Schema.Types.ObjectId,
    ref: 'measure',
    required: false,
  }]
}, {...schemaOptions})

module.exports = StatisticSchema