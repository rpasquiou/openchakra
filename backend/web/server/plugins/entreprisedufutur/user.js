const lodash = require('lodash')
const { loadFromDb } = require('../../utils/database')
const UserTicket = require('../../models/UserTicket')
const EventTicket = require('../../models/EventTicket')

const getLooking = async function () {
  const looking = await loadFromDb({model: 'user', fields: ['looking_for_opportunities']})

  
  const ids = lodash.filter(looking, (u) => u.looking_for_opportunities ).map((u) => u._id)

  return ids
}

const getEvents = async function (userId, params, data) {
  const userTickets = await UserTicket.find({user: data._id})
  const eventTicketsIds = userTickets.map((ticket)=> {return ticket.event_ticket})
  const eventTickets = await EventTicket.find({_id: {$in: eventTicketsIds}})
  return eventTickets.map(ticket => ticket.event)
}

module.exports = { 
  getLooking,
  getEvents,
 }