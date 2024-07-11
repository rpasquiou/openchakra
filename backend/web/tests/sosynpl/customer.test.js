const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../../web/server/plugins/sosynpl/functions')
const User = require('../../server/models/User')
const { ROLE_CUSTOMER } = require('../../server/plugins/sosynpl/consts')
require('../../server/server')
const moment = require('moment')


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
})