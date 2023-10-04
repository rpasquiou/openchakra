const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let RecipeIngredientSchema=null

try {
  RecipeIngredientSchema=require(`../plugins/${getDataModel()}/schemas/RecipeIngredientSchema`)
  customizeSchema(RecipeIngredientSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = RecipeIngredientSchema ? mongoose.model('recipeIngredient', RecipeIngredientSchema) : null
