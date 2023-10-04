const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let KeySchema=null

try {
  KeySchema=require(`../plugins/${getDataModel()}/schemas/KeySchema`)
  customizeSchema(KeySchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = KeySchema ? mongoose.model('key', KeySchema) : null
