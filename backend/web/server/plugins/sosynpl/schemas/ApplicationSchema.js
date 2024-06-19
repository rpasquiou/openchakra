const mongoose = require('mongoose')
const moment = require('moment')
const autoIncrement = require('mongoose-auto-increment')
const {schemaOptions} = require('../../../utils/schemas')
const { APPLICATION_STATUS, APPLICATION_STATUS_DRAFT } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const ApplicationSchema = new Schema({
  announce: {
    type: Schema.Types.ObjectId,
    ref: 'announce',
    required: [true, `L'annonce est obligatoire`]
  },
  freelance: {
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
    required: [true, `Le freelance est obligatoire`]
  },
  why_me: {
    type: String,
    required: false,
  },
  deliverable: {
    type: String,
    required: false,
  },
  detail: {
    type: String,
    required: false,
  },
  start_date: {
    type: Date,
    required: [true, `La date de début estimée est obligatoire`],
  },
  end_date: {
    type: String,
    required: [true, `La date de fin estimée est obligatoire`],
  },
  sent_date: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: Object.keys(APPLICATION_STATUS),
    default: APPLICATION_STATUS_DRAFT,
    required: [true, `Le statut est obligatoire`],
  },
  _counter: {
    type: Number,
  }
}, schemaOptions)

ApplicationSchema.virtual('quotations', {
  ref: 'quotation',
  foreignField: 'application',
  localField: '_id',
})

ApplicationSchema.virtual('latest_quotations', {
  ref: 'quotation',
  foreignField: 'application',
  localField: '_id',
  options: { sort: { creation_date: -1 }, limit:1 },
  array: true,
})

// Manage announce serial number
if (mongoose.connection) {
  autoIncrement.initialize(mongoose.connection) // Ensure autoincrement is initalized
}

ApplicationSchema.plugin(autoIncrement.plugin, { model: 'application', field: '_counter', startAt: 1});

ApplicationSchema.virtual('serial_number', DUMMY_REF).get(function() {
  if (!this._counter) {
    return undefined
  }
  return `P${moment().format('YY')}${this._counter.toString().padStart(5, 0)}`
})


module.exports = ApplicationSchema
