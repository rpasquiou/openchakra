const { connectToDatabase, disconnectFromDatabase } = require('./testSetup.js')
const { getModels } = require('../../server/utils/database')
require('../../server/models/Company')
require('../../server/models/User')
require('../../server/models/School')
require('../../server/plugins/cyberleague/functions')

beforeAll(async () => {
  await connectToDatabase()
})

afterAll(async () => {
  await disconnectFromDatabase()
})

describe('models', () => {
  it('prints models', async () => {
    const models = await getModels()
    console.log(models)
    expect(models).toBeInstanceOf(Object)
    expect(Object.keys(models).length).toBeGreaterThan(0)
  })
})
