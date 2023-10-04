const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let IngredientSchema=null

try {
  IngredientSchema=require(`../plugins/${getDataModel()}/schemas/IngredientSchema`)
  customizeSchema(IngredientSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = IngredientSchema ? mongoose.model('ingredient', IngredientSchema) : null
