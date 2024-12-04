const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let UserTicketSchema=null

try {
  UserTicketSchema=require(`../plugins/${getDataModel()}/schemas/UserTicketSchema`)
  UserTicketSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserTicketSchema ? mongoose.model('userTicket', UserTicketSchema) : null