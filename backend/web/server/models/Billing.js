const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let BillingSchema=null

try {
  BillingSchema=require(`../plugins/${getDataModel()}/schemas/BillingSchema`)
  customizeSchema(BillingSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = BillingSchema ? mongoose.model('billing', BillingSchema) : null
