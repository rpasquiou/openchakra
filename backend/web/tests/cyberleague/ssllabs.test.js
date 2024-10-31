const { default: axios } = require("axios")

describe(`score tests`, () => {

  const EMAIL=process.env?.SSLLABS_EMAIL

  beforeAll(async () => {
  })
  
  afterAll(async () => {
  })

  it(`must initiate SLL Labs scan`, async () => {
    const res=await axios.get(
      'https://api.ssllabs.com/api/v4/analyze?host=smartdiet-validation.my-alfred.io&all=on', {
      headers: {email: EMAIL}
      }
    )
    console.log(res.data.endpoints[0].grade)
    const det=res.data.endpoints[0].details.suites.map(s => [s.protocol, s.list.map(l => l)])
    console.log(JSON.stringify(det, null, 2))
  })

  it(`must get SLL Labs info`, async () => {
    const res=await axios.get(
      'https://api.ssllabs.com/api/v4/info', {
      headers: {email: EMAIL}
      }
    )
    console.log(res.data)
  })
})