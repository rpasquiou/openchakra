const mongoose=require('mongoose')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const { lockSession } = require('../../server/plugins/aftral-lms/block')
const { getDatabaseUri } = require('../../config/config')

const lockTheSession = async sessionId => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  return lockSession(sessionId)
  }

const sessionId=process.argv[2]
if (!sessionId) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} sessionId`)
  process.exit(1)
}

lockTheSession(sessionId)
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))

