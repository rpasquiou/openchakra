const mongoose = require('mongoose')
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
require('../../server/models/Chapter')
require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')
const { setSessionInitialStatus } = require('../../server/plugins/aftral-lms/functions')


describe('Test models computations', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must set session trainees first status', async() => {
    const sessions=await Block.find({type: 'session'})
    const [session]=sessions
    await setSessionInitialStatus(session._id)
  })

})
