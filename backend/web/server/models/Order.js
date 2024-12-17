const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let OrderSchema=null

try {
  OrderSchema=require(`../plugins/${getDataModel()}/schemas/OrderSchema`)
  OrderSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = OrderSchema ? mongoose.model('order', OrderSchema) : null