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

  it('must find children with zombie parents', async() => {
    let allParents=(await Block.find({parent: {$ne: null}}).select({parent:1})).map(b => b.parent)
    console.log('before', allParents.length)
    allParents=lodash.uniqBy(allParents, p => p._id.toString())
    console.log('afte (unique)', allParents.length)
    const parents=await Block.countDocuments({_id: {$in: allParents}})
    console.log('found parents', parents)
  })

  it.only('must find blocks with zombie origins', async() => {
    let allRelatives=(await Block.find({origin: {$ne: null}}).select({origin:1})).map(b => b.origin)
    console.log('before', allRelatives.length)
    allRelatives=lodash.uniqBy(allRelatives, p => p._id.toString())
    console.log('after (unique)', allRelatives.length)
    const parents=await Block.find({_id: {$in: allRelatives}})
    console.log('found origins', parents.length)
    console.log(lodash.differenceBy(allRelatives, parents, obj => obj._id.toString()))
  })

})