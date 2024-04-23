const axios=require('axios')
const moment=require('moment')

const CREATE_TICKET_URL=`https://pro.smartdiet.fr/ws/application-ticket`
const GET_TICKETS_URL=`https://pro.smartdiet.fr/ws/application-tickets-by-email/`
const CREATE_COMMENT_URL=`https://pro.smartdiet.fr/ws/application-ticket-comment`

const createTicket = params => {
  return axios.post(CREATE_TICKET_URL, {...params, tag: 'diet'})
}

const getTickets = email => {
  return axios.get(GET_TICKETS_URL+email)
    .then(({data}) => data)
}

module.exports={
  createTicket, getTickets,
}