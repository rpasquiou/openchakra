const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let EventTicketSchema=null

try {
  EventTicketSchema=require(`../plugins/${getDataModel()}/schemas/EventTicketSchema`)
  EventTicketSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = EventTicketSchema ? mongoose.model('eventTicket', EventTicketSchema) : null