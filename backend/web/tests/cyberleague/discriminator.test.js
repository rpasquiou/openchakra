const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Admin = require('../../server/models/Admin')
const Partner = require('../../server/models/Partner')
const Member = require('../../server/models/Member')
require('../../server/models/School')
require('../../server/models/Expertise')
require('../../server/models/Gift')
require('../../server/models/Event')
require('../../server/models/Company')
const { ROLE_ADMIN, ROLE_PARTNER, ROLE_MEMBER } = require('../../server/plugins/cyberleague/consts')
require('../../server/plugins/cyberleague/functions')

beforeAll(async () => {
  await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe('discriminator key', ()=>{
  it('must discriminate over key', async()=>{

    const user1=await Admin.create({password: 'pass1', email: 'test1@test.com', firstname: 'first', lastname: 'last', role: ROLE_ADMIN})
    const user2=await Partner.create({password: 'pass2', email: 'test2@test.com', firstname: 'first', lastname: 'last', role: ROLE_PARTNER})
    const user3=await Member.create({password: 'pass3', email: 'test3@test.com', firstname: 'first', lastname: 'last', role: ROLE_MEMBER})

    const loadedU= await loadFromDb({model: 'user', fields:['role']})
    const loadedA= await loadFromDb({model: 'admin', fields:['role']})
    const loadedP= await loadFromDb({model: 'partner', fields:['role']})
    const loadedM= await loadFromDb({model: 'member', fields:['role']})

    expect(loadedU.length).toEqual(3)
    expect(loadedA.length).toEqual(1)
    expect(loadedM.length).toEqual(1)
    expect(loadedP.length).toEqual(1)

    expect(loadedA[0].role).toEqual(ROLE_ADMIN)
    expect(loadedP[0].role).toEqual(ROLE_PARTNER)
    expect(loadedM[0].role).toEqual(ROLE_MEMBER)

    expect(loadedA[0]._id).toEqual(user1._id)
    expect(loadedP[0]._id).toEqual(user2._id)
    expect(loadedM[0]._id).toEqual(user3._id)
  })
})