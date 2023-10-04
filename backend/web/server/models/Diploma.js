const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let DiplomaSchema=null

try {
  DiplomaSchema=require(`../plugins/${getDataModel()}/schemas/DiplomaSchema`)
  customizeSchema(DiplomaSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = DiplomaSchema ? mongoose.model('diploma', DiplomaSchema) : null
