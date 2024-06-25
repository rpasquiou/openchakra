const mongoose = require('mongoose')
const { getDatabaseUri } = require('../../config/config')
require('../../server/plugins/aftral-lms/functions')
const {MONGOOSE_OPTIONS}=require('../../server/utils/database')
const Block=require('../../server/models/Block')
const { getAscendantPaths } = require('../../server/plugins/aftral-lms/cartography')

describe('Test cartogrpahy', () => {

  beforeAll(async() => {
    return mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must get proper ascendants', async() => {
    const blocks=await Block.find({code: /17777/})
    console.log(blocks.map(b => [b._id, b._locked]))
    // const paths=await getAscendantPaths(blocks[3]._id)
    // console.log(paths)
  })

})
