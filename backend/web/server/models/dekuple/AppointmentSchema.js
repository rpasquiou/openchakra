const mongoose = require('mongoose')
const {APPOINTMENT_TYPE} = require('../../../utils/dekuple/consts')
const {schemaOptions} = require('../../utils/schemas')

const Schema = mongoose.Schema

const AppointmentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  type: { // Heartbeat, Blood pressure
    type: String,
    enum: Object.keys(APPOINTMENT_TYPE),
    required: true,
  },
  otherTitle: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
}, schemaOptions)

AppointmentSchema.virtual('type_str').get(() => {
  if (!this.type) {
    return null
  }
  if (this.type==APPOINTEMNT_OTHER) {
    return this.otherTitle
  }
  return APPOINTMENT_TYPE[this.type]
})

module.exports = AppointmentSchema
