const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let AppointmentTypeSchema=null

try {
  AppointmentTypeSchema=require(`../plugins/${getDataModel()}/schemas/AppointmentTypeSchema`)
  customizeSchema(AppointmentTypeSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AppointmentTypeSchema ? mongoose.model('appointmentType', AppointmentTypeSchema) : null
