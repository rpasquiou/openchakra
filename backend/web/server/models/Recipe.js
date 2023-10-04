const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let RecipeSchema=null

try {
  RecipeSchema=require(`../plugins/${getDataModel()}/schemas/RecipeSchema`)
  customizeSchema(RecipeSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = RecipeSchema ? mongoose.model('recipe', RecipeSchema) : null
