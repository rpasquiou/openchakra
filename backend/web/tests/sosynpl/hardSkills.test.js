const moment = require('moment')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/Training')
require('../../server/models/Application')
require('../../server/models/JobFile')
const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const User = require('../../server/models/User')
const { ROLE_CUSTOMER, ROLE_FREELANCE } = require('../../server/plugins/sosynpl/consts')

describe('Hard Skills', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must return freelance hard_slills_categories', async () => {
    const [user] = await loadFromDb({ model: 'customerFreelance', id: '665f18d022507a581d925f79', fields: ['hard_skills_categories'] })
    console.log(JSON.stringify(user.hard_skills_categories,null,2))
  })
})