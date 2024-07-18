const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DUMMY_REF } = require("../../../utils/database");

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
  }
}, schemaOptions
)

module.exports = StatisticSchema