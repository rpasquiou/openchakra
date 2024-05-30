const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const {SPOON_SOURCE} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const BillingSchema = new Schema({
  month: {
    type: Date,
    required: false,
  },
  assessment_count: {
    type: Number,
    required: true,
  },
  assessment_total: {
    type: Number,
    required: true,
  },
  followup_count: {
    type: Number,
    required: true,
  },
  followup_total: {
    type: Number,
    required: true,
  },
  nutrition_count: {
    type: Number,
    required: true,
  },
  nutrition_total: {
    type: Number,
    required: true,
  },
  impact_count: {
    type: Number,
    required: false,
  },
  impact_total: {
    type: Number,
    required: false,
  },
  total: {
    type: Number,
    required: true,
  },
  moy_appointments_coachings: {
    type: Number,
    required: false
  },
  fullname: {
    type: String,
    required: false
  }
}, schemaOptions)

module.exports = BillingSchema
