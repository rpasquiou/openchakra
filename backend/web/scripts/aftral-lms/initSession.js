const mongoose=require('mongoose')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { getDatabaseUri } = require('../../config/config')
const { setSessionInitialStatus } = require('../../server/plugins/aftral-lms/block')
const { getBlockChildren } = require('../../server/plugins/aftral-lms/resources')
const Progress = require('../../server/models/Progress')
const Session = require('../../server/models/Session')
require('../../server/plugins/aftral-lms/functions')

const rootId=process.argv[2]

if (!rootId) {
  console.error('expected rootId parameter')
}

const initSession = async sessionId => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  const exists=await Session.exists({_id: sessionId})
  if (!exists) {
    console.log('no')
    throw new Error(`Session ${sessionId} introuvable`)
  }
  const children=await getBlockChildren({blockId: sessionId})
  await Promise.all(children.map(c => Progress.remove({block: c._id})))
  return setSessionInitialStatus(sessionId)
}

const session=process.argv[2]

if (!session) {
  console.error('Expecting session id')
}
initSession(session)
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))


