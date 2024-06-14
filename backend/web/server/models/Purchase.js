const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let PurchaseSchema=null

try {
  PurchaseSchema=require(`./PurchaseSchema`)
  PurchaseSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PurchaseSchema ? mongoose.model('purchase', PurchaseSchema) : null
