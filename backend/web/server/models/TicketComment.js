const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let TicketCommentSchema=null

try {
  TicketCommentSchema=require(`../plugins/${getDataModel()}/schemas/TicketCommentSchema`)
  TicketCommentSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TicketCommentSchema ? mongoose.model('ticketComment', TicketCommentSchema) : null
