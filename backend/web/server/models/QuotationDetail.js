const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let QuotationDetailSchema=null
try {
  QuotationDetailSchema=require(`../plugins/${getDataModel()}/schemas/QuotationDetailSchema`)
  customizeSchema(QuotationDetailSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = QuotationDetailSchema ? mongoose.model('quotationDetail', QuotationDetailSchema) : null
