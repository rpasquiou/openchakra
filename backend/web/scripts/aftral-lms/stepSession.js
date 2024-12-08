const mongoose=require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const { getBlockStatus, saveBlockStatus, updateSessionStatus } = require('../../server/plugins/aftral-lms/block')
const { getDatabaseUri } = require('../../config/config')
const { getBlockResources } = require('../../server/plugins/aftral-lms/resources')
const Session = require('../../server/models/Session')
const { BLOCK_STATUS_TO_COME, BLOCK_STATUS_FINISHED, BLOCK_STATUS_CURRENT } = require('../../server/plugins/aftral-lms/consts')
const Block = require('../../server/models/Block')

// Finish the next available resource in the session
const stepSession = async sessionId => {
  await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  
  const session=await Session.findById(sessionId)
  if (!session) {
    throw new Error(`Session introuvable`)
  }
  if (session.trainees.length>1) {
    throw new Error(`Plus d'un apprenant, stop`)
  }
  const traineeId=session.trainees[0]._id
  const resources=await getBlockResources({blockId: sessionId, userId: traineeId, includeUnavailable: false, includeOptional: true})
  console.log(await Promise.all(resources.map(async r => {
    [r]=await loadFromDb( {model: 'block', id:r._id, user: traineeId, fields: ['fullname']}); return r.fullname
  })))
  const statuses=await Promise.all(resources.map(r => getBlockStatus(traineeId, {}, {_id: r._id})))
  console.log(statuses)
  let idx=statuses.indexOf(BLOCK_STATUS_TO_COME)
  if (idx==-1) {
    idx=statuses.indexOf(BLOCK_STATUS_CURRENT)
  }
  if (idx==-1) {
    throw new Error(`No more resources`)
  }
  const nextResource=resources[idx]
  console.log('Next resource', nextResource.fullname, 'finishing it')
  await saveBlockStatus(traineeId, nextResource._id, BLOCK_STATUS_FINISHED)
  await updateSessionStatus(sessionId)
}

const sessionId=process.argv[2]
if (!sessionId) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} sessionId`)
  process.exit(1)
}

stepSession(sessionId)
  .then(console.log)
  .catch(console.error)
  .finally(() => process.exit(0))

