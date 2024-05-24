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
    ref: 'freelance',
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
  status: {
    type: String,
    enum: Object.keys(APPLICATION_STATUS),
    default: APPLICATION_STATUS_NONE,
    required: [true, `Le statut est obligatoire`],
  }
}, schemaOptions)

module.exports = ApplicationSchema
