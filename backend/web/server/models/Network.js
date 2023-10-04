const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let NetworkSchema=null

try {
  NetworkSchema=require(`../plugins/${getDataModel()}/schemas/NetworkSchema`)
  customizeSchema(NetworkSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = NetworkSchema ? mongoose.model('network', NetworkSchema) : null
