const mongoose = require('mongoose')
const User = require('../../server/models/User')
require('../../server/models/QuestionCategory')
require('../../server/models/School')
require('../../server/models/ExpertiseSet')
require('../../server/models/Gift')
require('../../server/models/Event')
require('../../server/models/Comment')
require('../../server/models/Certification')
require('../../server/models/CustomerSuccess')
require('../../server/models/ExpertiseCategory')
require('../../server/models/Answer')
require('../../server/models/CLModules')
const { loadFromDb, MONGOOSE_OPTIONS } = require('../../server/utils/database')
require('../../server/plugins/cyberleague/functions')

describe(`Contents test`, () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/cyberleague`, MONGOOSE_OPTIONS)
  })
  
  afterAll(async () => {
    await mongoose.connection.close()
  })
  
  
  it(`must get admin contents`, async () => {
    const user=await User.findOne({email: 'wilfrid.albersdorfer@wappizy.com'})    
    const model='loggedUser'
    const fields='admin_companies.name,admin_companies,admin_companies.contents.type,admin_companies.contents.title,admin_companies.contents.expertise_set.main_expertise_category.name,admin_companies.contents.creation_date,admin_companies.contents.creator.firstname,admin_companies.contents.creator.lastname,admin_companies.contents.active,admin_companies.contents.likes_count,admin_companies.contents,admin_companies.contents.comments_count,admin_companies.statut'.split(',')
    const data=await loadFromDb({model, user, fields})
    console.log(JSON.stringify(data[0].admin_companies[0].contents, null, 2))
  })
})