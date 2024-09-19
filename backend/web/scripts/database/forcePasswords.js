const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')
const PASSWD='Password1;Password1;'

// import all of our models - they need to be imported only once
const User = require('../../server/models/User')
const { getDatabaseUri } = require('../../config/config')

const updatePasswords= async () => {
  console.log('open')
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  console.log('opened')
  return User.updateMany({}, {password: PASSWD})
}

updatePasswords()
  .then(console.log)
  .catch(console.error)
  // .finally(() => process.exit(0))
