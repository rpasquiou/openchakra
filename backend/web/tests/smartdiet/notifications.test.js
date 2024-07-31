const lodash=require('lodash')
const moment=require('moment')
const mongoose = require('mongoose')
const {forceDataModelSmartdiet}=require('../utils')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { USER_DATA, COMPANY_NO_INSURANCE_DATA, WEBINAR_DATA } = require('./data/modelsBaseData')
const User = require('../../server/models/User')
const Company = require('../../server/models/Company')
const { sendAppointmentRemindTomorrow } = require('../../server/plugins/smartdiet/mailing')

forceDataModelSmartdiet()

require('../../server/plugins/smartdiet/functions')


describe('Notifications ', () => {

  var user;
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    const company=await Company.create({...COMPANY_NO_INSURANCE_DATA, })
    user=await User.create({...USER_DATA, password:'hop', email: 'sebastien.auvray@wappizy.com', company})
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('Must send SMS', async () => {
    const user=({email: 'test@wappizy.com', phone: '+33675774324'})
    const diet=({firstname: 'Sonia'})
    const appointment={
      start_date: moment().add(1, 'day'), 
      end_date: moment().add(1, 'day').add(30, 'minute'),
      user, diet
    }
    await sendAppointmentRemindTomorrow({appointment})
  })
})

