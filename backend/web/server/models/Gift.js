const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let GiftSchema=null

try {
  GiftSchema=require(`../plugins/${getDataModel()}/schemas/GiftSchema`)
  customizeSchema(GiftSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = GiftSchema ? mongoose.model('gift', GiftSchema) : null
