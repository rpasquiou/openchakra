const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, getModels } = require('../../server/utils/database')
require('../../server/plugins/cyberleague/functions')
require('../../server/server')
jest.setTimeout(30000000)

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/cyberleague`, MONGOOSE_OPTIONS)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('models', ()=>{
  it('prints models', async()=>{
    const models = await getModels()
    console.log(models)
  })
})