const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let MenuRecipeSchema=null

try {
  MenuRecipeSchema=require(`../plugins/${getDataModel()}/schemas/MenuRecipeSchema`)
  customizeSchema(MenuRecipeSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = MenuRecipeSchema ? mongoose.model('menuRecipe', MenuRecipeSchema) : null
