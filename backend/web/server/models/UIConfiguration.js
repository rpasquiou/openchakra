const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let UIConfigurationSchema=null

try {
  UIConfigurationSchema=require(`../plugins/${getDataModel()}/schemas/UIConfigurationSchema`)
  customizeSchema(UIConfigurationSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UIConfigurationSchema ? mongoose.model('uiconfiguration', UIConfigurationSchema) : null
