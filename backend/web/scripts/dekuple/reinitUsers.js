const { createUser } = require('../../server/utils/withings')
const { updateTokens } = require('../../server/plugins/dekuple/functions')
const User = require('../../server/models/User')
const mongoose = require('mongoose')
const { getDataModel, getDatabaseUri } = require('../../config/config')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
//require('../../server/plugins/dekuple/functions')
const lodash=require('lodash')

const LIMIT=10

const updateUser = user => {
  console.log(`Handling ${user.email}`)
  user.withings_usercode=null
  user.withings_id=null
  user.access_token=null
  user.refresh_token=null
  user.csrf_token=null

  return user.save()
    .then(user => createUser(user))
    .then(code=> {user.withings_usercode=code; return user.save()})
    .then(user => updateTokens(user))
  }


const run = () => {
  console.log('start')
  if (getDataModel()!='dekuple') {
    throw new Error('Script to run under dekuple model only')
  }
  console.log(getDatabaseUri())
  return mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
    .then(() => User.count({withings_id:null}))
    .then(count => console.log(`Still ${count} users to handle, handling ${LIMIT}`))
    .then(() => User.find({withings_id:null}).limit(LIMIT))
    .then(users => Promise.allSettled(users.map(u => updateUser(u))))
    .then(results => {
      const groups=lodash.groupBy(results, 'status')
      console.log(`Updated ${groups['fulfilled']?.map(v => v.value.email)}`)
      console.error(`Errors ${groups['rejected']?.map(v => JSON.stringify(v, null,2))}`)
      console.log(`Success:${groups['fulfilled']?.length||0}, failed:${groups['rejected']?.length||0}`)
    })

}

return run()
  .then(console.log)
  .catch(console.error)

