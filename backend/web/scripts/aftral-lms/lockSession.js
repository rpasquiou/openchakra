const mongoose=require('mongoose')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const { lockSession } = require('../../server/plugins/aftral-lms/block')
const { getDatabaseUri } = require('../../config/config')
const Progress = require('../../server/models/Progress')
const { getBlockChildren } = require('../../server/plugins/aftral-lms/resources')
const User = require('../../server/models/User')

const lockTheSession = async (sessionId, traineeId) => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  const trainee=await User.findById(traineeId)
  if (!trainee) {
    throw new Error(`Trainee ${traineeId} not found`)
  }
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  
  const children = await getBlockChildren({ blockId: sessionId })
  await Progress.remove({user: trainee, block: {$in: [sessionId, ...children]}})
  await lockSession(sessionId, trainee)
  const childrenCount=children.length
  const progressCount=await Progress.countDocuments()
  console.log(childrenCount, progressCount)
  }

const [sessionId, traineeId]=process.argv.slice(2, 4)
if (!sessionId || !traineeId) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} sessionId traineeId`)
  process.exit(1)
}

lockTheSession(sessionId, traineeId)
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))

