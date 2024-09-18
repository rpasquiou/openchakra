const mongoose = require('mongoose')
const lodash=require('lodash')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Block = require('../../server/models/Block')
const { BLOCK_TYPE } = require('../../server/plugins/aftral-lms/consts')

jest.setTimeout(60*1000)

describe('Post', () => {
  let post, user, comment, feed

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  const getBlockName = block => {
    if (!block) {
      return null
    }
    return `${block.type} ${block.name} (${block._id})`
  }

  const getBlockHierarchyName = async block => {
    const thisName=await getBlockName(block)
    if (!block?.parent) {
      return thisName
    }
    const parentName=await getBlockHierarchyName(await Block.findById(block.parent).lean())
    return `${parentName}/${thisName}`
  }

  const countChildren = async id => {
    return Block.countDocuments({parent: id})
  }

  it(`templates's origins must have the same children`, async() => {
    const blocks=await Block.find({[BLOCK_TYPE]: {$nin: ['resource', 'session']}, origin: {$ne: null}, _locked: false}).lean()
    const grouped=lodash(blocks).groupBy(BLOCK_TYPE).mapValues(v => v.length)
    console.log(grouped.value())
    for (const block of blocks) {
      const actual=await countChildren(block._id)
      const expected=await countChildren(block.origin._id)
      const msg=`Block ${await getBlockHierarchyName(block)} should have ${expected} children but has ${actual}`
      const msgexists=`Origine inconnue pour ${await getBlockName(block)}`
      try {
        const originExists=await Block.exists({_id: block.origin._id})
        expect(originExists, msgexists).toBeTruthy()
        expect(actual, msg).toEqual(expected)
      }
      catch(err) {
        console.log(err.message)
      }
    }
  })

  it(`children's order must be consistent`, async() => {
    const blocks=await Block.find({parent: {$ne:null}}, {parent:1, order:1}).sort({parent:1, order:1}).lean()
    const grouped=lodash(blocks)
      .groupBy(b=>b.parent._id.toString())
      .omitBy(v => v.length<2)
    grouped.values().forEach(v => {
      const orders=v.map(child => child.order-1)
      const expected=lodash.range(v.length)
      if (!lodash.isEqual(orders, expected)) {
        console.log(`Incorrect children order for ${v[0].parent}:${orders}`)
      }
    })
  })

})