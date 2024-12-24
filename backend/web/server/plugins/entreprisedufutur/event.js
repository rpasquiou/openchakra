const UserTicket = require('../../models/UserTicket')
const EventTicket = require('../../models/EventTicket')

const getRegistered = async function (userId, params, data) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  const userTickets = await UserTicket.find({event_ticket: {$in: eventTicketIds}})
  return userTickets.map(ticket=> ticket.user)
}

module.exports = {
  getRegistered,
}