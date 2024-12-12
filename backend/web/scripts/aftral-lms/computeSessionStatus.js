const mongoose=require('mongoose')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const { lockSession, computeBlockStatus, updateSessionStatus } = require('../../server/plugins/aftral-lms/block')
const { getDatabaseUri } = require('../../config/config')
const Progress = require('../../server/models/Progress')
const { getBlockChildren } = require('../../server/plugins/aftral-lms/resources')

const computeSessionStatus = async sessionId => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  
  await updateSessionStatus(sessionId)
  }

const sessionId=process.argv[2]
if (!sessionId) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} sessionId`)
  process.exit(1)
}

computeSessionStatus(sessionId)
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))

