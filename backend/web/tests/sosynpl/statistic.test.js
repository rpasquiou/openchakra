const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Statistic = require('../../server/models/Statistic')

require('../../server/models/User')
require('../../server/models/Sector')
require('../../server/models/Job')
require('../../server/models/JobFile')
require('../../server/models/Application')
require('../../server/models/Measure')
require('../../server/plugins/sosynpl/functions')
//require('../../server/server')

describe('Statistic', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })
  afterAll(async () => {
    await mongoose.connection.close()
  })

  it.only('must return users_count', async() => {
    const stat = await Statistic.create({})
    const fields = ['users_count','current_missions_count','registrations_statistic']
    const [s] = await loadFromDb({model: 'statistic', fields, id:stat._id})
    expect(s.registrations_statistic.length).toEqual(12)
  })
})