const mongoose = require('mongoose')
const moment = require('moment')
const autoIncrement = require('mongoose-auto-increment')
const {schemaOptions} = require('../../../utils/schemas')
const { APPLICATION_STATUS, APPLICATION_STATUS_DRAFT, APPLICATION_REFUSE_REASON, APPLICATION_STATUS_REFUSED, APPLICATION_STATUS_ACCEPTED, WORK_MODE, WORK_DURATION, EXPERIENCE, SS_PILAR, SEARCH_MODE } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const SearchSchema = new Schema({
  mode: {
    type: String,
    enum: Object.keys(SEARCH_MODE),
    required: [true, `Le mode de recherche (${Object.values(SEARCH_MODE).join(',')}) est obligatoire`]
  },
  city: {
    type: AddressSchema,
    required: false,
  },
  city_radius: {
    type: Number,
    required: false,
  },
  work_mode: {
    type: String,
    enum: Object.keys(WORK_MODE),
    required: false,
  },
  work_duration: {
    type: String,
    enum: Object.keys(WORK_DURATION),
    required: false,
  },
  experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    required: false,
  },
  pilars: [{
    type: String,
    enum: Object.keys(SS_PILAR),
    required: false,
  }],
  sectors: [{
    type: Schema.Types.ObjectId,
    ref: 'sector',
  }],
  min_daily_rate: {
    type: Number,
    required: false,
  },
  max_daily_rate: {
    type: Number,
    required: false,
  },
  expertises: [{
    type: Schema.Types.ObjectId,
    ref: 'expertise',
  }],
  available: {
    type: Boolean,
    required: false,
  },
  profiles: [{
    type: Schema.Types.ObjectId,
    ref: 'mission',
  }],
  missions: [{
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
  }],
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */


module.exports = SearchSchema
