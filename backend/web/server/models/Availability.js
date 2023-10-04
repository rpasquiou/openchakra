const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let AvailabilitySchema=null

try {
  AvailabilitySchema=require(`../plugins/${getDataModel()}/schemas/AvailabilitySchema`)
  customizeSchema(AvailabilitySchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AvailabilitySchema ? mongoose.model('availability', AvailabilitySchema) : null
