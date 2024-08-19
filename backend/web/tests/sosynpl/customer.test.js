const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../../web/server/plugins/sosynpl/functions')
const User = require('../../server/models/User')
const { ROLE_CUSTOMER, ROLE_FREELANCE } = require('../../server/plugins/sosynpl/consts')
const moment = require('moment')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/Training')
require('../../server/models/Application')
require('../../server/models/JobFile')
require('../../server/models/Report')
require('../../server/models/Mission')
require('../../server/models/Quotation')

describe('Customer', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must return customer_applications', async () => {
    const user = await User.findOne({role:ROLE_CUSTOMER})
    console.log(user,'......................',moment().millisecond())
    const id = '6661adbaeb49ff38fc686de5'
    // const apps = await loadFromDb({model:'user', user, id, fields:['applications'], })
    // console.log(apps,'.....................')
  })

  it.only('must return customer_reports', async() => {
    const customerId = await User.findOne({role:ROLE_CUSTOMER})._id
    const [customer] = await loadFromDb({model:'customer', id:customerId, fields:['customer_reports']})
    expect(customer.customer_reports.length).toBeGreaterThanOrEqual(0)
    const freelanceId = await User.findOne({role:ROLE_FREELANCE})._id
    const [freelance] = await loadFromDb({model:'freelance', id:freelanceId, fields:['freelance_reports']})
    expect(freelance.freelance_reports.length).toBeGreaterThanOrEqual(0)
  })
})