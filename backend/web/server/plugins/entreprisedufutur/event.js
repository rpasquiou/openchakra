const UserTicket = require('../../models/UserTicket')
const EventTicket = require('../../models/EventTicket')
const User = require('../../models/User')
const { USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT, USERTICKET_STATUS_REGISTERED, USERTICKET_STATUS_WAITING_LIST } = require('./consts')
const { loadFromDb, idEqual } = require('../../utils/database')

const getStatus = (status) => {
  let statusFilter = {}
  if (status == 'registered') {
    statusFilter = {$in: [USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT,USERTICKET_STATUS_REGISTERED]}
  }
  if (status == 'waiting') {
    statusFilter = USERTICKET_STATUS_WAITING_LIST
  }
  return async function (userId, params, data, fields) {
    const eventTickets = await EventTicket.find({event: data._id})
    const eventTicketIds = eventTickets.map(ticket => ticket._id)
    const userTickets = await UserTicket.find({event_ticket: {$in: eventTicketIds}, status: statusFilter})

    const userIds = userTickets.map(ticket => ticket.user)

    const requiredFields = ['firstname', 'lastname']
    if (fields) {
      requiredFields.push(...fields)
    }
    
    const users = await loadFromDb({
      model: 'user',
      user: userId,
      fields: requiredFields,
      params: {...params, 'filter._id': {$in: userIds}}
    })
    return users.map(u => new User(u))
  }
}

const getRegisteredNumber = async function (userId, params, data,fields) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  const userTickets = await UserTicket.find({event_ticket: {$in: eventTicketIds}, status: {$in: [USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT,USERTICKET_STATUS_REGISTERED]}})
  return userTickets.map(ticket=> ticket.user).length
}

const getReservableTickets = async function (userId, params, data, fields) {
  const user = await User.findById(userId)
  const eventTickets = await EventTicket.find({event: data._id})
  
  return eventTickets.filter((t) => {
    return t.targeted_roles.includes(user.role)
  })
}

const getBookedTickets = async function (userId, params, data, fields) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  
  const userTickets = await UserTicket.find({
    event_ticket: {$in: eventTicketIds},
    user: userId,
    status: {$in: [USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT, USERTICKET_STATUS_REGISTERED]}
  })
  
  const bookedTickets = await EventTicket.find({
    _id: {$in: userTickets.map(ut => ut.event_ticket)}
  }).populate('event')
  
  return bookedTickets
}

const getWaitingTickets = async function (userId, params, data, fields) {
  const eventTickets = await EventTicket.find({event: data._id})
  const eventTicketIds = eventTickets.map(ticket => ticket._id)
  
  const userTickets = await UserTicket.find({
    event_ticket: {$in: eventTicketIds},
    user: userId,
    status: USERTICKET_STATUS_WAITING_LIST
  })
  
  const waitingTickets = await EventTicket.find({
    _id: {$in: userTickets.map(ut => ut.event_ticket)}
  }).populate('event')
  
  return waitingTickets
}

const getIsRegistered = async function (userId, params, data,fields) {
  const registeredUsers = await getStatus('registered')(userId, params, data, fields)
  return registeredUsers.some(user => idEqual(user._id, userId))
}

module.exports = {
  getStatus,
  getRegisteredNumber,
  getReservableTickets,
  getIsRegistered,
  getBookedTickets,
  getWaitingTickets,
}