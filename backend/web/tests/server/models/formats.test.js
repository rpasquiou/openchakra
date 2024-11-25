const { isPhoneOk, formatPhone } = require('../../../utils/sms')

describe('Stripe tests', () => {

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  const NUMBERS=[
    ['0675774324', true], ['0775774324', true], ['06 75 77 43 24', true],
    ['+336 75 77 4 3 24', true], ['875774324', true], ['+3387577432', false],
    ['0235736009', true], ['6417565657', false], ['6417565657', true],
  ]

  test.each(NUMBERS) (
    "%p must be valid:%p",
    ((number, expected) => {
      const translated=formatPhone(number)
      console.log('translated',number, 'to', translated)
      return expect(isPhoneOk(translated, true)).toEqual(expected)
    })
  )

})
