const {
  MONGOOSE_OPTIONS,
  buildPopulates,
  getMongooseModels
} = require('../../server/utils/database')
const { forceDataModelSmartdiet } = require('../utils')
const moment = require('moment')
const mongoose = require('mongoose')
forceDataModelSmartdiet()
const User=require('../../server/models/User')
const Company=require('../../server/models/Company')
const Content=require('../../server/models/Content')
const Comment=require('../../server/models/Comment')
const Key=require('../../server/models/Key')
require('../../server/models/Target')
require('../../server/models/Category')
require('../../server/models/Association')
require('../../server/models/Question')
require('../../server/models/UserQuizz')
require('../../server/models/Item')
const {loadFromDb}=require('../../server/utils/database')
require('../../server/plugins/smartdiet/functions')

jest.setTimeout(10000)

describe('Validate virtual attributes mapping', ()=> {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  test('Check virtual attribute populate', () => {
    const res=buildPopulates('user', ['latest_coachings.diet'])
    console.log(JSON.stringify(res, null, 2))
  })

})
