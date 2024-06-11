const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { APPLICATION_STATUS, APPLICATION_STATUS_NONE } = require('../consts')

const Schema = mongoose.Schema

const ApplicationSchema = new Schema({
  announce: {
    type: Schema.Types.ObjectId,
    ref: 'announce',
    required: [true, `L'annonce est obligatoire`]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
    required: [true, `Le freelance est obligatoire`]
  },
  description: {
    type: String,
    required: [true, `La description est obligatoire`],
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
  status: {
    type: String,
    enum: Object.keys(APPLICATION_STATUS),
    default: APPLICATION_STATUS_NONE,
    required: [true, `Le statut est obligatoire`],
  }
}, schemaOptions)

ApplicationSchema.virtual('quotations', {
  ref: 'quotation',
  foreignField: 'quotation',
  localField: '_id',
})

module.exports = ApplicationSchema
