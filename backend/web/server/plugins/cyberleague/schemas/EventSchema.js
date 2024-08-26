
const moment = require('moment')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { schemaOptions } = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const EventSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
  },
  start_date: {
    type: Date,
    required: [true, 'La date de début est obligatoire'],
  },
  end_date: {
    type: Date,
    required: [true, 'La date de fin est obligatoire'],
  },
  picture: {
    type: String,
    required: false,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: [true, 'La compagnie est obligatoire'],
  },
  is_webinaire: {
    type: Boolean,
    required: false
  },
  expertises: [{
    type: Schema.Types.ObjectId,
    ref: 'expertise',
    required: false,
    index: true,
  }]
}, schemaOptions)

module.exports = EventSchema
