const UserTicket = require('../../models/UserTicket')
const EventTicket = require('../../models/EventTicket')
const User = require('../../models/User')
const { USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT, USERTICKET_STATUS_REGISTERED } = require('./consts')
const { loadFromDb } = require('../../utils/database')

const getRegistered = async function (userId, params, data,fields) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  const userTickets = await UserTicket.find({event_ticket: {$in: eventTicketIds}, status: {$in: [USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT,USERTICKET_STATUS_REGISTERED]}})
  
  const users = await loadFromDb({
    model: 'user',
    user: userId,
    fields,
    params: {...params,'filter._id':{$in: userTickets.map(u => u._id)}}
  })
  return users.map(u=> new User(u))
}

const getRegisteredNumber = async function (userId, params, data,fields) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  const userTickets = await UserTicket.find({event_ticket: {$in: eventTicketIds}, status: {$in: [USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT,USERTICKET_STATUS_REGISTERED]}})
  return userTickets.map(ticket=> ticket.user).length
}

const getReservableTickets = async function (userId, params, data,fields) {
  const user = await User.findById(userId)
  const eventTickets = await EventTicket.find({event: data._id})
  return eventTickets.filter((t) => {
      return t.targeted_roles.includes(user.role)
    })
}

const getIsRegistered = async function (userId, params, data,fields) {
  const users = await getRegistered(userId, params, data,fields)
  const usersId = users.map (u => u._id)
  return usersId.includes(userId)
}

module.exports = {
  getRegistered,
  getRegisteredNumber,
  getReservableTickets,
  getIsRegistered,
}