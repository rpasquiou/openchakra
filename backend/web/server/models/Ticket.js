const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let TicketSchema=null

try {
  TicketSchema=require(`../plugins/${getDataModel()}/schemas/TicketSchema`)
  TicketSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TicketSchema ? mongoose.model('ticket', TicketSchema) : null
