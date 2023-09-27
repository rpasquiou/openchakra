const moment = require('moment')
const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, callPreCreateData, callPostCreateData } = require('../../server/utils/database')
const {forceDataModelTracker}=require('../utils')
const {USER_DATA, ISSUE_DATA, PROJECT_DATA}=require('./data/modelsBaseData')

forceDataModelTracker()
require('../../server/plugins/tracker/functions')

const User=require('../../server/models/User')
const Project=require('../../server/models/Project')
require('../../server/models/Issue')

describe('Access rights', () => {

  let user, project

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    user=await User.create({...USER_DATA})
    project=await Project.create({...PROJECT_DATA})
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must forbid no role to create issue', async() => {
    const model='issue'
    const params={...ISSUE_DATA, user, project}
    const createPromise=callPreCreateData({model, params, user})
      .then(({model, params}) => {
        return mongoose.connection.models[model]
          .create([params], {runValidators: true})
          .then(([data]) => {
            return callPostCreateData({model, params, data, user})
          })
    })
    expect(createPromise).rejects.toMatch(/interdit/i)
  })

})
