const UserTicket = require('../../models/UserTicket')
const EventTicket = require('../../models/EventTicket')
const User = require('../../models/User')

const getRegistered = async function (userId, params, data,fields) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  const userTickets = await UserTicket.find({event_ticket: {$in: eventTicketIds}})
  const users = await loadFromDb({
    model: 'event',
    user: userId,
    fields,
    params: {...params,
              'filter._id':{$in: userTickets.map(u => u._id)},
            }
  })
  return users.map(u=> new User(u))
}

const getRegisteredNumber = async function (userId, params, data) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  const userTickets = await UserTicket.find({event_ticket: {$in: eventTicketIds}})
  return userTickets.map(ticket=> ticket.user).length
}

module.exports = {
  getRegistered,
  getRegisteredNumber,
}