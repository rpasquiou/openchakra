const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')
const {
  MONGOOSE_OPTIONS,
  getModels,
  getRequiredFields,
  loadFromDb,
  replaceReliesOn
} = require('../../server/utils/database')
const mongoose = require('mongoose')
const {forceDataModelSmartdiet}=require('../utils')

forceDataModelSmartdiet()
require('../../server/plugins/smartdiet/functions')
const User=require('../../server/models/User')
require('../../server/models/Target')
require('../../server/models/UserQuizz')
require('../../server/models/Key')
require('../../server/models/Association')
require('../../server/models/Item')
require('../../server/models/Question')

jest.setTimeout(60000)

describe('Measure model ', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/smartdiet`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  const checkResult = users => {
    const user=users.find(u => /caro q/i.test(u.fullname))
    expect(user).toBeTruthy()
    console.log(user)
    expect(user.latest_coachings).toHaveLength(1)
    expect(user.latest_coachings[0].diet).toBeTruthy()
    expect(user.latest_coachings[0].diet.fullname).toEqual('Anne-Laure Meunier')
  }

  it.only('mongoose loading', async() => {
    console.time('DB')
    const users=await User.find({}, {fullname: 1, lastname: 1, firstname: 1}).populate([
      {path: 'coachings', select:{diet:1, [CREATED_AT_ATTRIBUTE]:1}, populate: {path: 'diet', select: ['firstname', 'lastname', 'fullname']}},
    ]).lean({virtuals: true})
    console.timeEnd('DB')
    checkResult(users)
  })

  it(`Test fields replacement`, async() => {
    const org='latest_coachings'
    const dest='coachings'
    const fields=[
      ['latest_coachings', 'coachings'],
      ['a.latest_coachings.hop','a.coachings.hop'],
      ['latest_coachingsu', 'latest_coachingsu']
    ]
    fields.forEach(([field, expected]) => {
      expect(replaceReliesOn('latest_coachings', 'coachings', field)).toBe(expected)
    })
  })

  it('must compute required fields', async() => {
    const allModels=await getModels()
    const fields=await getRequiredFields('user', ['fullname', 'company.name', 'latest_coachings.diet.fullname'], allModels)
    console.log('result', fields)
  })

  it('custom loading', async() => {
    console.time('Custom')
    const users=await loadFromDb({model: 'user', fields: ['fullname', 'company.name', 'latest_coachings.diet.fullname']})
    console.timeEnd('Custom')
    checkResult(users)
  })

})
