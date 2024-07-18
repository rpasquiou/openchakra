const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Statistic = require('../../server/models/Statistic')
const { preProcessGetDONTMESS } = require('../../server/plugins/sosynpl/functions')
require('../../server/models/User')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/JobFile')
require('../../server/models/Application')
require('../../server/plugins/sosynpl/functions')
// require('../../server/server')

describe('Statistic', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl}`, MONGOOSE_OPTIONS)

  })
  afterAll(async () => {
    await mongoose.connection.close()
  })
  it('must return users_count', async() => {
    const s = await loadFromDb({model: 'statistic', fields:['users_count','current_missions_count']})
    console.log(s)
  })
})