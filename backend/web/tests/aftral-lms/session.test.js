const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')
require('../../server/models/Chapter')
require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')
const { getSessionBlocks, lockSession, updateSessionStatus, } = require('../../server/plugins/aftral-lms/block')
const Session = require('../../server/models/Session')
const Progress = require('../../server/models/Progress')

jest.setTimeout(60000)

describe('Test models computations', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it.skip('must set session trainees first status', async() => {
    const sessions=await Block.find({type: 'session'})
    const [session]=sessions
    await setSessionInitialStatus(session._id)
  })

  it('must lock session', async() => {
    const sessions=await Block.find({type: 'session'})
    await Promise.all(sessions.map(s => lockSession(s._id)))
  })

  it('must inspect session', async() => {
    const session=await Block.findById('669facc63d858662e785fd7d')
    let blocks=await getSessionBlocks(session)
  })

  it('must test types', async() => {
    const session=await Block.findOne({_locked: true, origin: {$ne: null}})
    console.log(session.origin.constructor.name)
    await session.populate('origin').execPopulate()
    console.log(session.origin.constructor.name)
  })

  it.only('Must update session status', async() => {
    const session=await Session.findOne().populate('trainees')
    // await Progress.deleteMany({})
    let status=await Progress.distinct('achievement_status')
    let count=await Progress.countDocuments()
    console.log(status, count)
    await updateSessionStatus(session._id)
    status=await Progress.distinct('achievement_status')
    count=await Progress.countDocuments()
    console.log(status, count)
})

})
