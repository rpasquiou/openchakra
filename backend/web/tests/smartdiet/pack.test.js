const mongoose = require('mongoose')
const moment=require('moment');
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database');
const Company = require('../../server/models/Company');
const {COMPANY_NO_INSURANCE_DATA, USER_DATA}=require('./data/modelsBaseData');
const User = require('../../server/models/User')
require('../../server/models/Job')
require('../../server/models/DeclineReason')
require('../../server/models/JoinReason')
require('../../server/models/FoodDocument')

require('../../server/plugins/smartdiet/functions')

describe('Pack buy tests', () => {

  let user;

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    const company=await Company.create({...COMPANY_NO_INSURANCE_DATA})
    user=await User.create({...USER_DATA, password: 'tagada', email: 'patient@smartdiet.com', company})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must allow buying pack if no coaching in progress and no company coaching available', async() => {
    const loadedUser=await loadFromDb({model: 'user', id: user._id, user, fields:['can_buy_pack']})
    expect(loadedUser[0].can_buy_pack).toEqual(true)
  })

})
