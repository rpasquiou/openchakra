const axios=require('axios')
const moment=require('moment')
const FormData=require('form-data')
const {Readable}=require('stream')

const CREATE_TICKET_URL=`https://pro.smartdiet.fr/ws/application-ticket`
const GET_TICKETS_URL=`https://pro.smartdiet.fr/ws/application-tickets-by-email/`
const CREATE_COMMENT_URL=`https://pro.smartdiet.fr/ws/application-ticket-comment`
const UPLOAD_URL=`https://pro.smartdiet.fr/ws/appfileupload`

// CreateTicket attachment must be a ReadStream
const createTicket = async ({subject, message, priority, sender, attachment=null}) => {
  // Attachment mmust be Readable
  if (!!attachment && !(attachment instanceof Readable)) {
    throw new Error(`Attachement must implement stream.Readable`)
  }
  let data={subject, message, priority, sender, tag: 'diet'}
  if (attachment) {
    const formData=new FormData()
    formData.append('appticketpic', attachment)
    const config = {
      headers: {
        ...formData.getHeaders()
      }
    }
    const attId=await axios.post(UPLOAD_URL, formData, config)
      .then(res => res.data)
    data.attachment=attId
  }
  return axios.post(CREATE_TICKET_URL, data)
    .then(res => res.data)
}

const getTickets = email => {
  return axios.get(GET_TICKETS_URL+email)
    .then(({data}) => {
      const mapped=data.map(ticket => ({
        ...ticket,
        date: ticket.date.replace(/\+.*$/, ''),
      }))
      return mapped
    })
}

const createComment = ({jiraid, text}) => {
  return axios.post(CREATE_COMMENT_URL, {jiraid, text})
}

module.exports={
  createTicket, getTickets, createComment,
}