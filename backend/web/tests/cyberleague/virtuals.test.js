const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Company = require('../../server/models/Company')
const Content = require('../../server/models/Content')
const { CONTENT_TYPE_ARTICLE, ROLE_PARTNER } = require('../../server/plugins/cyberleague/consts')
const User = require('../../server/models/User')
require('../../server/models/School')
require('../../server/models/ExpertiseSet')
require('../../server/models/Gift')
require('../../server/models/Event')
require('../../server/models/Certification')
require('../../server/models/CustomerSuccess')
require('../../server/models/ExpertiseCategory')
require('../../server/models/Score')
require('../../server/plugins/cyberleague/functions')

let user, content, company
beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  company=await Company.create({name: 'companyTest', is_partner: true})
  user=await User.create({firstname: 'partner', lastname: 'test', email: 'email@test.com', role: ROLE_PARTNER, password: 'test', company: company._id, looking_for_opportunities: true})
  content=await Content.create({title: 'titleTest', type: CONTENT_TYPE_ARTICLE, creator: user._id})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe(`Virtuals test`, () => {
  it('company must have contents', async () =>{
    //const loadedComp = await loadFromDb({model: 'company', fields:['contents.creator']})
    const loadedU = await loadFromDb({model: 'user', fields:['company', 'users_looking_for_opportunities']})
    console.log('user', loadedU);
    // const loadedCont = await loadFromDb({model: 'content', fields:['creator']})

    // expect(loadedComp.length).toEqual(1)
    // expect(loadedCont.length).toEqual(1)
    // expect(loadedU.length).toEqual(1)
    
    // const loadedCompany = loadedComp[0]
    // const loadedContent = loadedCont[0]
    // const loadedUser = loadedU[0]

    // expect(loadedCompany._id).toEqual(company._id)
    // expect(loadedUser._id).toEqual(user._id)
    // expect(loadedContent._id).toEqual(content._id)

    // expect(loadedUser.company._id).toEqual(company._id)
    // expect(loadedContent.creator._id).toEqual(user._id)
    // expect(loadedCompany.users.length).toEqual(1)
    // expect(loadedCompany.users[0]._id).toEqual(user._id)

    // expect(loadedCompany.contents.length).toEqual(1)
    // expect(loadedCompany.contents[0]._id).toEqual(content._id)

  })
})