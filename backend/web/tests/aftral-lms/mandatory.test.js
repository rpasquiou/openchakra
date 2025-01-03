const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')
const Block = require('../../server/models/Block')
const { getMandatoryResourcesCount } = require('../../server/plugins/aftral-lms/resources')

jest.setTimeout(120000)

describe('Count mandatory resources', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must fix mandatory resources count', async () => {
    const blocks=await Block.find({_locked: true}, {mandatory_resources_count:1})
    console.log('Got', blocks.length, 'locked blocks')
    for (const block of blocks) {
      const mandatoryCount=await getMandatoryResourcesCount(null, null, {_id: block._id})
      if (block.mandatory_resources_count!=mandatoryCount) {
        console.log('Updating', block._id, 'from',block.mandatory_resources_count, 'to', mandatoryCount)
        await Block.findByIdAndUpdate(block._id, {mandatory_resources_count: mandatoryCount})
      }
    }
  })
})