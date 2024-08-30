const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')
const { propagateAttributes } = require('../../server/plugins/aftral-lms/block')
const { runPromisesWithDelay } = require('../../server/utils/concurrency')

jest.setTimeout(10*60*3600)

describe('Test atributes propagation', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })
  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('Must propagate attributes', async () => {
    const templates=(await Block.find({origin: null}, {_id:1}))
    await runPromisesWithDelay(templates.map((template, idx) => () => {
      console.log(idx, '/', templates.length)
      return propagateAttributes(template._id)
    }))
    .then(res => console.log(res.filter(r => r.status=='rejected').map(r => r.reason)))
  })
})