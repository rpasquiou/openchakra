const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const {
  beforeAll,
  describe,
  jest,
  afterAll,
  it,
  expect,
} = require('@jest/globals')
const JobUser = require('../../server/models/JobUser')
require('../../server/plugins/all-inclusive/functions')
require('../../server/models/Skill')
require('../../server/models/Activity')

jest.setTimeout(10000)

describe('Search JobUser', function () {
  console.log('========== 🚀 Starting Search JobUser ==========')

  let job

  beforeAll(async function () {
    try {
      await mongoose.connect(
        `mongodb://localhost:27017/test${moment().unix()}`,
        MONGOOSE_OPTIONS
      )
    } catch (error) {
      throw new Error(`❌ Could not connect to the database ${error}`)
    }
    job = await JobUser.create({
      name: 'Analyste de bases de données',
      user: new mongoose.Types.ObjectId(),
    })
  })

  afterAll(async function () {
    try {
      await mongoose.connection.db.dropDatabase()
      await mongoose.connection.close()
      console.log('========== 🏁 Ending Search JobUser ==========')
    } catch (error) {
      throw new Error(`❌ Could not close the database ${error}`)
    }
  })

  it('should throw error when trying to filter on user when user is missing', async () => {
    await loadFromDb({
      model: 'jobUser',
      fields: ['name', 'user'],
      id: null,
      user: null,
      params: { 'filter.search_field': 'Analyste de bases de données' },
    })
  })
})
