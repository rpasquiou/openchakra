const mongoose = require('mongoose')
const lodash = require('lodash')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
require('../../server/models/Chapter')
require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')
const { setSessionInitialStatus, lockSession } = require('../../server/plugins/aftral-lms/functions')
const { getSessionBlocks } = require('../../server/plugins/aftral-lms/block')

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

  it.only('must test types', async() => {
    const session=await Block.findOne({_locked: true, origin: {$ne: null}})
    console.log(session.origin.constructor.name)
    await session.populate('origin').execPopulate()
    console.log(session.origin.constructor.name)
  })

})
