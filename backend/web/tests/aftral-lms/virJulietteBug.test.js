const mongoose = require('mongoose')
const lodash = require('lodash')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')

describe('Post', () => {
  let post, user, comment, feed
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must return comments on post', async() => {
    let allParents=(await Block.find({parent: {$ne: null}}).select({parent:1})).map(b => b.parent)
    console.log('before', allParents.length)
    allParents=lodash.uniqBy(allParents, p => p._id.toString())
    console.log('afte (unique)', allParents.length)
    const parents=await Block.countDocuments({_id: {$in: allParents}})
    console.log('found parents', parents)
  })
})