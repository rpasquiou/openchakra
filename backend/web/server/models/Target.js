const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let TargetSchema=null

try {
  TargetSchema=require(`../plugins/${getDataModel()}/schemas/TargetSchema`)
  customizeSchema(TargetSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TargetSchema ? mongoose.model('target', TargetSchema) : null
