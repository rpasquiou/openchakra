const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, getModels, loadFromDb } = require('../../server/utils/database')
const User = require('../../server/models/User')
require('../../server/models/Company')
require('../../server/models/Partner')
require('../../server/models/Expertise')
require('../../server/models/School')
require('../../server/models/Group')
const { ROLE_ADMIN } = require('../../server/plugins/cyberleague/consts')
require('../../server/plugins/cyberleague/functions')

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe('models', ()=>{

  it('prints models', async()=>{
    const models = await getModels()
    expect(models).toBeInstanceOf(Object);
    expect(Object.keys(models).length).toBeGreaterThan(0);
  })

  it('must compute user shortname', async()=>{
    const user=await User.create({password: 'pass', email: 'test@test.com', firstname: 'first', lastname: 'last', role: ROLE_ADMIN})
    const [loaded]=await loadFromDb({model: 'user', id: user._id, fields:['shortname', 'fullname']})
    expect(loaded.fullname).toEqual('first last')
    expect(loaded.shortname).toEqual('first l.')
  })

})