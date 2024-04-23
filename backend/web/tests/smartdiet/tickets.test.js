const axios=require('axios')

jest.setTimeout(60000)

describe('Jira tickets tests ', () => {

  const DIET_EMAIL='stephanieb.smartdiet@gmail.com'

  const CREATE_TICKET_URL=`https://pro.smartdiet.fr/ws/application-ticket`
  const GET_URL=`https://pro.smartdiet.fr/ws/application-tickets-by-email/`
  const CREATE_COMMENT_URL=`https://pro.smartdiet.fr/ws/application-ticket-comment`

  it('must create a ticket', async() => {
    const data={
      subject: 'Sujet du ticket',
      message: 'Message du ticket',
      priority: '5',
      sender: DIET_EMAIL,
      tag: 'diet'
    }
    const res=await axios.post(CREATE_TICKET_URL, JSON.stringify(data))
    expect(res.data).toEqual('OK')
  })

  it.only(`must get diet's tickets`, async () => {
    const url=GET_URL+DIET_EMAIL
    const res=await axios.get(url)
    console.log(res.data)
  })

  it(`must add a comment on each diet's ticket`, async () => {
    const url=GET_URL+DIET_EMAIL
    const res=await axios.get(url)
    const tickets=res.data
    const promises=tickets.map(ticket => {
      const data={
        jiraid: ticket.jiraid.toString(),
        message: `Commentaire sur le ticket jira #${ticket.jiraid}`
      }
      console.log(data)
      return axios.post(CREATE_COMMENT_URL, JSON.stringify(data))
    })
    return Promise.all(promises)
  })

})
