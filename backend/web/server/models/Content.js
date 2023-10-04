const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let ContentSchema=null

try {
  ContentSchema=require(`../plugins/${getDataModel()}/schemas/ContentSchema`)
  customizeSchema(ContentSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ContentSchema ? mongoose.model('content', ContentSchema) : null
