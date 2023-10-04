const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let ShopSchema=null

try {
  ShopSchema=require(`../plugins/${getDataModel()}/schemas/ShopSchema`)
  customizeSchema(ShopSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ShopSchema ? mongoose.model('shop', ShopSchema) : null
