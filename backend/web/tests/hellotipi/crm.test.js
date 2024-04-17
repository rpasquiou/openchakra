const moment=require('moment')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')
const mongoose = require('mongoose')
const {forceDataModelAllInclusive}=require('../utils')
const Opportunity=require('../../server/models/Opportunity')
const { BOOLEAN_NO } = require('../../server/plugins/all-inclusive/consts')
const User = require('../../server/models/User')
const Lead = require('../../server/models/Lead')
const {CUSTOMER_USER} = require('./data/modelsBaseData')

forceDataModelAllInclusive()
require('../../server/plugins/all-inclusive/functions')

jest.setTimeout(20000)

describe('Test missions quotations', () => {

  let customer, lead, creator

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    customer=await User.create({...CUSTOMER_USER})
    creator=customer
    lead=await Lead.create({...CUSTOMER_USER, creator: customer, fullname: 'Full name'})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('opportunity must require lead or customer', async() => {
    const fn=() => Opportunity.create({
      recurrent: BOOLEAN_NO, creator: customer, start_date: moment(), zip_code: 76, name: 'opp',
    })
    return expect(fn).rejects.toThrow()
  })

  it('opportunity must accept lead', async() => {
    await Opportunity.create({
      recurrent: BOOLEAN_NO, creator: customer, start_date: moment(), zip_code: 76, name: 'opp',
      lead_customer: lead,
    })
  })

  it('opportunity must accept user', async() => {
    await Opportunity.create({
      recurrent: BOOLEAN_NO, creator: customer, start_date: moment(), zip_code: 76, name: 'opp',
      registered_customer: customer
    })
  })

  it('opportunity must not accept lead and user', async() => {
    const fn=() => Opportunity.create({
      recurrent: BOOLEAN_NO, creator: customer, start_date: moment(), zip_code: 76, name: 'opp',
      lead_customer: lead, registered_customer: customer,
    })
    return expect(fn).rejects.toThrow()
  })
})
