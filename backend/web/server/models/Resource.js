const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ResourceSchema=null

try {
  ResourceSchema=require(`../plugins/${getDataModel()}/schemas/ResourceSchema`)
  customizeSchema(ResourceSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ResourceSchema ? mongoose.model('resource', ResourceSchema) : null
