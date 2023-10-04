const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ConsultationSchema=null

try {
  ConsultationSchema=require(`../plugins/${getDataModel()}/schemas/ConsultationSchema`)
  customizeSchema(ConsultationSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ConsultationSchema ? mongoose.model('consultation', ConsultationSchema) : null
