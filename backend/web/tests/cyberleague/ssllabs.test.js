const { default: axios } = require("axios")

describe(`score tests`, () => {

  const EMAIL='cyber-team@visiativ.com'

  beforeAll(async () => {
  })
  
  afterAll(async () => {
  })

  it(`must connect to SLL Labs`, async () => {
    const res=await axios.get(
      'https://api.ssllabs.com/api/v4/analyze?host=smartdiet-validation.my-alfred.io&all=on', {
      headers: {email: EMAIL}
      }
    )
    console.log(res.data)
  })
})