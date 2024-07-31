const axios=require('axios')
const moment=require('moment')
const fs=require('fs')
const path=require('path')
const FormData=require('form-data')
const { Readable } = require('stream')
const { createTicket, getTickets, createComment } = require('../../server/plugins/smartdiet/ticketing')

jest.setTimeout(60000)

describe('Jira tickets tests ', () => {

  const DIET_EMAIL='stephanieb.smartdiet@gmail.com'

  const ATTACHEMENT_PATH=path.join(__dirname, 'data', 'uploadPictureTest.jpg')
  const ATTACHEMENT_URL=`https://my-alfred-data-test.s3.eu-west-3.amazonaws.com/smartdiet/prod/public/66b04028-8465-441c-a4c2-d7aeddd97953soupe%20de%20pois.webp`

  it('must create a ticket', async() => {
    const data={
      subject: 'Sujet du ticket',
      message: 'Message du ticket',
      priority: '5',
      sender: DIET_EMAIL,
    }
    const res=await createTicket(data)
    expect(res).toEqual('OK')
  })

  it(`must get diet's tickets`, async () => {
    const res=await getTickets(DIET_EMAIL)
    expect(res.length).toBeGreaterThan(0)
    const PATTERN = {
      jiraid: expect.any(Number),
      author: expect.any(String),
      date: expect.any(String),
      subject: expect.any(String),
      message: expect.any(String),
      status: expect.any(String),
      priority: expect.any(Number),
      attachment: expect.any(Object),
    }
    return res.map(ticket => expect(ticket).toMatchObject(PATTERN))
  })

  it(`must add a comment on each diet's ticket`, async () => {
    let tickets=await getTickets(DIET_EMAIL)
    const ticketIds=tickets.map(t => t.jiraid)
    const commentText=`Comment on ${moment()}`
    await Promise.all(ticketIds.map(id => createComment({jiraid: id, text:commentText})))
    tickets=await getTickets(DIET_EMAIL)
    tickets.map(t => expect(t.comments.filter(c => c.text==commentText+'\n')).toHaveLength(1))
  })

  it.only('must create a ticket with file attachment', async() => {
    const attachmentStream=fs.createReadStream(ATTACHEMENT_PATH)
    const data={
      subject: 'Sujet avec pièce jointe',
      message: 'Message avec pièce jointe',
      priority: '5',
      sender: DIET_EMAIL,
      attachment: attachmentStream,
    }
    const res=await createTicket(data)
    expect(res).toEqual('OK')
  })

  it('must create a ticket with URL attachment', async() => {
    const attachmentStream=await axios.get(ATTACHEMENT_URL, {
      responseType: "stream",
    })
      .then(res => res.data)
    const data={
      subject: 'Sujet avec pièce jointe',
      message: 'Message avec pièce jointe',
      priority: '5',
      sender: DIET_EMAIL,
      attachment: attachmentStream,
    }
    const res=await createTicket(data)
    expect(res).toEqual('OK')
  })

})
