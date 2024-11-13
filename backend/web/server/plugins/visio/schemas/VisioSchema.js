const moment=require('moment')
const mongoose=require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const VisioSchema = new Schema({
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`]
  },
  // Duraiton in minutes
  duration: {
    type: Number,
    required: [true, `La durée en minutes est obnligatoire`]
  },
  title: {
    type: 'String',
    required: [true, `Le titres est obligatoire`]
  },
  // Url not required because will be provided
  url: {
    type: String,
    required: false,
  },
  room: {
    type: String,
    required: false,
  },
  _owner: {
    type: Schema.Types.ObjectId,
    refPath: '_owner_type',
    required: [true, `L'id du propriétaire est obligatoire`]
  },
  _owner_type: {
    type: String,
    required: [true, `Le type du propriétaire est obligatoire`]
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
VisioSchema.virtual('end_date', DUMMY_REF).get(function() {
  if (!this.start_date && !this.duration) {
    return moment(this.start_date).add(this.duration, 'minutes')
  }
})
/* eslint-enable prefer-arrow-callback */

module.exports = VisioSchema