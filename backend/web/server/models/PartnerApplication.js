const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let PartnerApplicationSchema=null

try {
  PartnerApplicationSchema=require(`../plugins/${getDataModel()}/schemas/PartnerApplicationSchema`)
  customizeSchema(PartnerApplicationSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PartnerApplicationSchema ? mongoose.model('partnerApplication', PartnerApplicationSchema) : null
