const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let CustomerSuccessSchema=null

try {
  CustomerSuccessSchema=require(`../plugins/${getDataModel()}/schemas/CustomerSuccessSchema`)
  CustomerSuccessSchema.plugin(mongooseLeanVirtuals)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CustomerSuccessSchema ? mongoose.model('customerSuccess', CustomerSuccessSchema) : null