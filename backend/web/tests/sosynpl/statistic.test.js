const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const { registrationStatistic } = require('../../server/plugins/sosynpl/statistic')
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
    const [s] = await loadFromDb({model: 'statistic', fields:['users_count','current_missions_count'], id:stat._id})
    console.log(await Statistic.find({}))
    console.log(s)
  })

  it('must return users per month', async () => {
    const measures = await registrationStatistic()
    expect(measures).toBeTruthy()
  })
})