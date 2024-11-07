const mongoose = require('mongoose')
const lodash = require('lodash')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
const Resource = require('../../server/models/Resource')
const Block = require('../../server/models/Block')
const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')
const Program = require('../../server/models/Program')
const { getBlockResources, getBlockChildren } = require('../../server/plugins/aftral-lms/resources')
const { ROLE_CONCEPTEUR } = require('../../server/plugins/aftral-lms/consts')
const User = require('../../server/models/User')

jest.setTimeout(60*1000)

describe('Resource params', () => {

  const SEQUENCE_ID='66e0d35d78b81144f6431376'

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must return comments on post', async() => {
    const user=await User.findOne({role: ROLE_CONCEPTEUR})
    const program=await Program.findOne({name: /TSDF01/}).select({name:1})
    let resources=await getBlockResources({blockId: program._id, userId: user._id, includeUnavailable: true, includeOptional: true})
    resources=await Resource.find({_id: {$in: resources}}).select({homework_mode:1, name:1, _forced_attributes:1}).lean({virtuals: true})
    console.log(resources.filter(r => !lodash.isEmpty(r._forced_attributes)))
  })

  it.only('must get program children', async() => {
    const program=await Program.findOne({name: /TSDF01/}).select({name:1})
    console.time('children')
    let children=await getBlockChildren({blockId: program._id})
    console.timeEnd('children')
    console.log(children.length)
    // Ensure each child has a parent in the array
    children.foeEach(b => {
      
    })
  })
})