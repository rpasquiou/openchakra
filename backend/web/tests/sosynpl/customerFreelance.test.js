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
    const users = await loadFromDb({model:'customerFreelance', fields:['customer_current_missions_count',
                                                                       'freelance_current_missions_count',
                                                                       'customer_coming_missions_count',
                                                                       'freelance_coming_missions_count',
                                                                       'fullname']})
    users.map(u=>console.table({user:u.fullname, 
                                customer_current_missions: u.customer_current_missions_count, 
                                freelance_current_missions: u.freelance_current_missions_count,
                                customer_coming_missions: u.customer_coming_missions_count, 
                                freelance_coming_missions: u.freelance_coming_missions_count,
                              }))
  })
})