const mongoose = require('mongoose')
const AddressSchema = require('../AddressSchema')
const lodash=require('lodash')
const Schema = mongoose.Schema
const formatDuration = require('format-duration')

const TraineeSessionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  trainee: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'session',
    required: true,
  },
  themes: [{
    type: Schema.Types.ObjectId,
    ref: 'traineeTheme',
    required: false,
  }],
}, {
  toJSON: {
    virtuals: true,
    getters: true,
  },
})

TraineeSessionSchema.virtual('spent_time').get(function() {
  return lodash.sum(this.themes.map(t => t.spent_time))
})

TraineeSessionSchema.virtual('spent_time_str').get(function() {
  const timeMillis=lodash.sum(this.themes.map(t => t.spent_time || 0))
  return formatDuration(timeMillis, {leading: true})
})

module.exports = TraineeSessionSchema
