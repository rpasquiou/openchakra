const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { APPLICATION_STATUS, APPLICATION_STATUS_DRAFT } = require('../consts')

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
  sent_date: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: Object.keys(APPLICATION_STATUS),
    default: APPLICATION_STATUS_DRAFT,
    required: [true, `Le statut est obligatoire`],
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

ApplicationSchema.pre('validate', async function(next) {
  const quotations=await mongoose.models.quotation.countDocuments({application: this._id})
  if (!quotations>0) {
    return next(new Error(`La candidature doit contenir un devis`))
  }
  next()
})

module.exports = ApplicationSchema
