const moment=require('moment')
const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const User = require('../../server/models/User')
const {USER_DATA, COMPANY_NO_INSURANCE_DATA}=require('./data/modelsBaseData')
const Company = require('../../server/models/Company')
const { crmGetAllContacts, crmDeleteContact, crmGetContact } = require('../../server/utils/crm')
require('../../server/plugins/smartdiet/functions')

describe('CRM tests', () => {

  const email='sebastien.auvray@wappizy.com'
  let user;

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('Must create user in CRM', async() => {
    try {
      await crmDeleteContact(email)
    }
    catch(err) { /* Silent error */ }
    const company=await Company.create({...COMPANY_NO_INSURANCE_DATA})
    let user=await User.create({...USER_DATA, password: 'Tagada123Tagada123', email, company})
    let crmUser=await crmGetContact(email)
    user.firstname='Robert'
    await user.save()
    await new Promise((resolve) => {setTimeout(resolve, 2000)})
    crmUser=await crmGetContact(email)
    expect(crmUser).toBeTruthy()
  })

})
