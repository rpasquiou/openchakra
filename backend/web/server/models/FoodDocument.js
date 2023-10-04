const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let FoodDocumentSchema=null

try {
  FoodDocumentSchema=require(`../plugins/${getDataModel()}/schemas/FoodDocumentSchema`)
  customizeSchema(FoodDocumentSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = FoodDocumentSchema ? mongoose.model('foodDocument', FoodDocumentSchema) : null
