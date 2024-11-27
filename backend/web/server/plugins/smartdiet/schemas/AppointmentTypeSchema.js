const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const {DUMMY_REF}=require('../../../utils/database')
const AppointmentType = require('../../../models/AppointmentType')

const Schema = mongoose.Schema

const AppointmentTypeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
  },
  // In minutes
  duration: {
    type: Number,
    required: [true, 'La durée est obligatoire'],
  },
  smartagenda_id: {
    type: String,
    required: [true, `L'identifiant Smartagenda est obligatoire`],
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
AppointmentTypeSchema.virtual('is_nutrition', DUMMY_REF).get(function() {
  return (/cn/i.test(this.title) || /nutri/i.test(this.title)) && !/ne plus prendre/i.test(this.title) && !/bilan/i.test(this.title) && !/suivi/i.test(this.title)
})
/* eslint-enable prefer-arrow-callback */

module.exports = AppointmentTypeSchema
