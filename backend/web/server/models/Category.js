const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let CategorySchema=null

try {
  CategorySchema=require(`../plugins/${getDataModel()}/schemas/CategorySchema`)
  customizeSchema(CategorySchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CategorySchema ? mongoose.model('category', CategorySchema) : null
