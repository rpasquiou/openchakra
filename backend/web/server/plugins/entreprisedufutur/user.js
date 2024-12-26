const lodash = require('lodash')
const { loadFromDb } = require('../../utils/database')
const UserTicket = require('../../models/UserTicket')
const EventTicket = require('../../models/EventTicket')
const { USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT, USERTICKET_STATUS_REGISTERED } = require('./consts')
const Event = require('../../models/Event')

const getLooking = async function () {
  const looking = await loadFromDb({model: 'user', fields: ['looking_for_opportunities']})

  
  const ids = lodash.filter(looking, (u) => u.looking_for_opportunities ).map((u) => u._id)

  return ids
}

const getEvents = async function (userId, params, data,fields) {
  const userTickets = await UserTicket.find({user: data._id,status: {$in: [USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT,USERTICKET_STATUS_REGISTERED]}})
  const eventTicketsIds = userTickets.map((ticket)=> {return ticket.event_ticket})
  const eventTickets = await EventTicket.find({_id: {$in: eventTicketsIds}})
  const events = await loadFromDb({
    model: 'event',
    user: userId,
    fields,
    params: {...params, 'filter._id':{$in: eventTickets.map(u => u._id)}}
  })
  return events.map((e)=> {return new Event(e)})
}

module.exports = { 
  getLooking,
  getEvents,
 }