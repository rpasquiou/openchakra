const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { ROLE_FREELANCE, ROLE_ADMIN, ROLE_CUSTOMER } = require('../../server/plugins/sosynpl/consts')
const { current_missions_count, coming_missions_count } = require('../../server/plugins/sosynpl/missions')
const User = require('../../server/models/User')
const Mission = require('../../server/models/Mission')

describe('Missions', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/sosynpl`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must return current_missions_count', async () => {
    const customer = await User.findOne({role: ROLE_CUSTOMER})
    const freelance = await User.findOne({role: ROLE_FREELANCE})
    const admin = await User.findOne({role: ROLE_ADMIN})
    let current_missions_customer = await current_missions_count(customer)
    console.table(current_missions_customer)
    expect(current_missions_customer).toBeTruthy()
    let current_missions_admin = await current_missions_count(admin)
    console.table(current_missions_admin)
    expect(current_missions_admin).toBeTruthy()
    let current_missions_freelance = await current_missions_count(freelance)
    console.table(current_missions_freelance)
    expect(current_missions_freelance).toBeTruthy()
  })
  it.only('must return coming_missions_count', async () => {
    const customer = await User.findOne({role: ROLE_CUSTOMER})
    const freelance = await User.findOne({_id: mongoose.Types.ObjectId("6661adbaeb49ff38fc686de5")})
    const admin = await User.findOne({role: ROLE_ADMIN})
    let coming_missions_customer = await coming_missions_count(customer)
    console.table(coming_missions_customer)
    expect(coming_missions_customer).toBeTruthy()
    let coming_missions_admin = await coming_missions_count(admin)
    console.table(coming_missions_admin)
    expect(coming_missions_admin).toBeTruthy()
    let coming_missions_freelance = await coming_missions_count(freelance)
    console.table(coming_missions_freelance)
    expect(coming_missions_freelance).toBeTruthy()
  })
})