const mongoose = require('mongoose')
const { getDatabaseUri } = require('../../config/config')
require('../../server/models/Chapter')
require('../../server/plugins/aftral-lms/functions')
const {MONGOOSE_OPTIONS}=require('../../server/utils/database')
const Block=require('../../server/models/Block')
const { getTemplateForBlock, getPathsForBlock } = require('../../server/plugins/aftral-lms/cartography')

jest.setTimeout(60000)

describe('Test cartogrpahy', () => {

  beforeAll(async() => {
    return mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must find the original template', async() => {
    // Try any non-template block
    const loadedBlock=await Block.findOne({origin: {$ne: null}})
    let foundTemplate=await getTemplateForBlock(loadedBlock._id)
    expect(foundTemplate.origin).toBeFalsy()
    // Try any template block
    const loadedTemplate=await Block.findOne({origin: null})
    foundTemplate=await getTemplateForBlock(loadedTemplate._id)
    expect(loadedTemplate._id).toEqual(foundTemplate._id)
  })

  it.only('must find the paths', async() => {
    // Try any non-template block
    // const block=await Block.findOne({type: 'resource', origin: null})
    // console.log('block.name', block.name)
    // const template=await getTemplateForBlock(block)
    // const paths=await getPathsForTemplate(block._id)
    console.time('compute')
    const paths=await getPathsForBlock(null, null, '6687f254d8e10b5d9ac7186e')
    console.log(JSON.stringify(paths, null, 2))
    console.timeEnd('compute')
  })

})
