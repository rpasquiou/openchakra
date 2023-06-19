const {forceDataModelDekuple}=require('../utils')
forceDataModelDekuple()
const { createUser } = require('../../server/utils/withings')
const { updateTokens } = require('../../server/plugins/dekuple/functions')
const User = require('../../server/models/User')
const mongoose = require('mongoose')
const { getDataModel, getDatabaseUri } = require('../../config/config')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')

describe('withings creation', () => {

  it('should create missing accounts', () => {
    console.log(getDatabaseUri())
    return mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
      .then(()=> User.find({withings_id: null}))
      .then(users=> {console.log(users.map(u=>u.email)); return users[0]})
      .then(user => {
        console.log(user.email)
        return createUser(user)
          .then(withings_id => {user.withings_id=withings_id; return user.save()})
      })
  })
})


