const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let LeadSchema=null

try {
  LeadSchema=require(`../plugins/${getDataModel()}/schemas/LeadSchema`)
  customizeSchema(LeadSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = LeadSchema ? mongoose.model('lead', LeadSchema) : null
