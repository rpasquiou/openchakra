const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let CategoryRateSchema=null

try {
  CategoryRateSchema=require(`../plugins/${getDataModel()}/schemas/CategoryRateSchema`)
  CategoryRateSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CategoryRateSchema ? mongoose.model('categoryRate', CategoryRateSchema) : null
