const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let OfferSchema=null

try {
  OfferSchema=require(`../plugins/${getDataModel()}/schemas/OfferSchema`)
  customizeSchema(OfferSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = OfferSchema ? mongoose.model('offer', OfferSchema) : null
