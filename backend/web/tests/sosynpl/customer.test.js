const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { ROLE_CUSTOMER, ROLE_FREELANCE } = require('../../server/plugins/sosynpl/consts')
const User = require('../../server/models/User')
const getApplications = require('../../server/plugins/sosynpl/customer')

describe('Customer', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must return customer_applications', async () => {
    const customer = await User.findOne({role: ROLE_CUSTOMER})
    const apps = await getApplications(customer)
    expect(apps).toBeTruthy()
  })
})