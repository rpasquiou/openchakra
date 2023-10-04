const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let CompanySchema=null

try {
  CompanySchema=require(`../plugins/${getDataModel()}/schemas/CompanySchema`)
  customizeSchema(CompanySchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CompanySchema ? mongoose.model('company', CompanySchema) : null
