const OrderTicket = require("../../models/OrderTicket")
const User = require("../../models/User")
const { loadFromDb } = require("../../utils/database")

const getUnknownEmails = async (userId, params, data) => {
  const [order] = await loadFromDb({
    model: 'order',
    fields: ['order_tickets.firstname', 'order_tickets.lastname', 'order_tickets.email', 'order_tickets.status','event_ticket'],
    id: data._id,
  })
  const unknownEmailTickets = await order.order_tickets.filter(async (t) => {
      const exist = await User.exists({email:t.email})
      return !exist
    })
  
  return unknownEmailTickets.map(ticket => new OrderTicket(ticket))
}

const getInputsValid = async (userId, params, data) => {
  const res = await OrderTicket.exists({order: data._id,$or:[{firstname: {$not: /[a-zA-Z]/}}, {lastname: {$not: /[a-zA-Z]/}}, {email: {$not: /[a-zA-Z]/}}]})
  return !res
}

module.exports = {
  getUnknownEmails,
  getInputsValid,
}