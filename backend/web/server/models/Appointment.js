const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let AppointmentSchema=null

try {
  AppointmentSchema=require(`../plugins/${getDataModel()}/schemas/AppointmentSchema`)
  customizeSchema(AppointmentSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AppointmentSchema ? mongoose.model('appointment', AppointmentSchema) : null
