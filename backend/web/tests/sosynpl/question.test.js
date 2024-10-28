const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const CustomerFreelance = require('../../server/models/CustomerFreelance')
const Question = require('../../server/models/Question')
const { CUSTOMER_DATA } = require('./data/base_data')
require('../../server/plugins/sosynpl/functions')
require('../../server/models/Sector')
require('../../server/models/JobFile')
require('../../server/models/Job')

describe('Questions', () => {

  beforeAll(async () => {
    const DBNAME = `test${moment().unix()}`
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must get question creator', async() => {
    await CustomerFreelance.create({...CUSTOMER_DATA})
    const user = await CustomerFreelance.findOne({})
    await Question.create({creator: user._id, title:'Test'})
    const [question] = await loadFromDb({model:'question', user, fields:['creator.fullname','title']})
    expect(question.creator.fullname).toEqual(user.fullname)
  })
})