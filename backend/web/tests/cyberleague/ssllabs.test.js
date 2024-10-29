const { default: axios } = require("axios")

describe(`score tests`, () => {

  const EMAIL='cyber-team@visiativ.com'

  beforeAll(async () => {
  })
  
  afterAll(async () => {
  })

  it(`must initiate SLL Labs scan`, async () => {
    const res=await axios.get(
      'https://api.ssllabs.com/api/v4/analyze?host=smartdiet-validation.my-alfred.io&all=on&s=13.36.62.148', {
      headers: {email: EMAIL}
      }
    )
    console.log(res.data)
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