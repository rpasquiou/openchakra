const mongoose = require('mongoose')
const moment = require('moment')
const autoIncrement = require('mongoose-auto-increment')
const {schemaOptions} = require('../../../utils/schemas')
const { APPLICATION_STATUS, APPLICATION_STATUS_DRAFT, APPLICATION_REFUSE_REASON, APPLICATION_STATUS_REFUSED, APPLICATION_STATUS_ACCEPTED, APPLICATION_VISIBILITY, APPLICATION_VISIBILITY_HIDDEN } = require('../consts')
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
  refuse_reason: {
    type: String,
    enum: Object.keys(APPLICATION_REFUSE_REASON),
    required: [function() { return this.status==APPLICATION_STATUS_REFUSED}, `La raison de refus est obligatoire`],
  },
  accept_date: {
    type: Date,
    required: [function() {return this.status==APPLICATION_STATUS_ACCEPTED}, `La date d'acceptation est obligatoire`],
  },
  refuse_date: {
    type: Date,
    required: [function() {return this.status==APPLICATION_STATUS_REFUSED}, `La date de refus est obligatoire`],
  },
  _counter: {
    type: Number,
  },
  visibility_status: {
    type: String,
    enum: Object.keys(APPLICATION_VISIBILITY),
    default: APPLICATION_VISIBILITY_HIDDEN,
  },
  cgu_accepted: {
    type: Boolean,
    validate: [v => !!v, 'Vous devez accepter les CGU'],
    required: [true, 'Vous devez accepter les CGU'],
  },
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
