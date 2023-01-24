const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let ShopSchema=null

try {
  ShopSchema=require(`../plugins/${getDataModel()}/schemas/ShopSchema`)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

ShopSchema?.plugin(mongooseLeanVirtuals)

module.exports = ShopSchema ? mongoose.model('shop', ShopSchema) : null
