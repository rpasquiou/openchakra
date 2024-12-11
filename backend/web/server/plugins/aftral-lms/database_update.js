const lodash=require('lodash')
const Ticket=require('../../models/Ticket')
const Session=require('../../models/Session')

const log = (...params) => {
  return console.log('DB Update', ...params)
}

const error = (...params) => {
  return console.error('DB Update', ...params)
}


const setSessionOnTickets = async () => {
  log('set session on tickets')
  const ticketsCount=await Ticket.countDocuments()
  const noSessionTickets=await Ticket.find({session: null})
  log('Got', ticketsCount, 'tickets,', noSessionTickets.length, 'without a session')
  for (const ticket of noSessionTickets) {
    const sessions=await Session.find({$or: [{trainees: ticket.user}, {trainers:ticket.user}]})
    if (sessions.length==1) {
      log('Ticket', ticket._id, 'has 1 session, updating')
      ticket.session=sessions[0]
      await ticket.save()
    }
    else {
      error('Ticket', ticket, 'has more than one (', sessions.length, ') session, can not update')
    }
  }
}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await setSessionOnTickets()
}

module.exports=databaseUpdate