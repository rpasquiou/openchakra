const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/models/User')
const { ROLE_PARTNER } = require('../../server/plugins/cyberleague/consts')
const Company = require('../../server/models/Company')
const Partner = require('../../server/models/Partner')
require('../../server/models/School')
require('../../server/models/Expertise')
require('../../server/models/Gift')
require('../../server/models/Event')
require('../../server/models/Certification')
require('../../server/models/CustomerSuccess')
require('../../server/models/ExpertiseSet')
require('../../server/plugins/cyberleague/functions')

let user, company
beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  user=await Partner.create({firstname: 'partner', lastname: 'test', email: 'email@test.com', role: ROLE_PARTNER, password: 'test'})
  company=await Company.create({name: 'companyTest', administrators: [user._id], is_partner: true})
  user.company = company._id
  user.save()
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe(`is_company_admin test`, () => {
  it(`must have correct is_company_admin`, async () => {
    const loadedC = await loadFromDb({model: 'company', fields:['administrators']})
    const loadedU = await loadFromDb({model: 'user', fields:['is_company_admin','company']})

    expect(loadedC.length).toEqual(1)
    expect(loadedU.length).toEqual(1)
    
    const loadedCompany = loadedC[0]
    const loadedUser = loadedU[0]

    expect(loadedCompany._id).toEqual(company._id)
    expect(loadedUser._id).toEqual(user._id)

    expect(loadedCompany.administrators.length).toEqual(1)
    expect(loadedCompany.administrators[0]._id).toEqual(user._id)

    expect(loadedUser.company._id).toEqual(company._id)
    expect(loadedUser.is_company_admin).toEqual(true)
  })
})