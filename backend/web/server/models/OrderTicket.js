const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let OrderTicketSchema=null

try {
  OrderTicketSchema=require(`../plugins/${getDataModel()}/schemas/OrderTicketSchema`)
  OrderTicketSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = OrderTicketSchema ? mongoose.model('orderTicket', OrderTicketSchema) : null