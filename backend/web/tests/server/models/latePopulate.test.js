const moment = require('moment')
const mongoose = require('mongoose')
const {
  MONGOOSE_OPTIONS,
} = require('../../../server/utils/database')
const Block=require('../../../server/models/Block')

describe('Ordering models', ()=> {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  test('Check late populate', async () => {
    const block=await Block.findOne({type: 'program'})
    expect(block.children).toBeUndefined()
    await block.populate('children').execPopulate()
    expect(block.children.length).toBeGreaterThan(0)
  })

})
