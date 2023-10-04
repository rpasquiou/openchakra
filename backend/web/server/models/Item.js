const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let ItemSchema=null

try {
  ItemSchema=require(`../plugins/${getDataModel()}/schemas/ItemSchema`)
  customizeSchema(ItemSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ItemSchema ? mongoose.model('item', ItemSchema) : null
