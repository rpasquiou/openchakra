const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const { MONGOOSE_OPTIONS, loadFromDb, idEqual } = require('../../server/utils/database')
const Module = require('../../server/models/Module')
const Chapter = require('../../server/models/Chapter')
const {BaseModule, BaseTrainee, BaseResource, BaseSequence} = require('./baseData')
const User = require('../../server/models/User')
const { ROLE_APPRENANT, BLOCK_TYPE_RESOURCE, BLOCK_STATUS_FINISHED } = require('../../server/plugins/aftral-lms/consts')
const Sequence = require('../../server/models/Sequence')
const Resource = require('../../server/models/Resource')
const Block = require('../../server/models/Block')
const {getBlockResources, getBlockChildren}=require('../../server/plugins/aftral-lms/resources')
const { computeBlockStatus, getBlockStatus, saveBlockStatus, isFinished } = require('../../server/plugins/aftral-lms/block')
const Progress = require('../../server/models/Progress')
jest.setTimeout(60000)

describe('Block resources', () => {
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  const ensureHierarchy = async() => {
    let chapter = await Chapter.findOne()
    let user = await User.findOne()
    if (chapter && user) {
      return { chapter, user }
    }
    console.log('Need to create')
    const NB = 2
    user = await User.create({ ...BaseTrainee, role: ROLE_APPRENANT, password: 'hop' })
    chapter = await Chapter.create({ name: '1s Chapitre', creator: user })
    for (let i = 0; i < NB; i++) {
      const mod = await Module.create({ ...BaseModule, creator: user, name: `${i + 1} module`, parent: chapter, order: i + 1 })
      for (let j = 0; j < NB; j++) {
        const seq = await Sequence.create({ ...BaseSequence, creator: user, name: `${i + 1}${j + 1} sequence `, parent: mod, order: j + 1 })
        for (let k = 0; k < NB; k++) {
          const name = `${i + 1}${j + 1}${k + 1} ressource`
          const mod = await Resource.create({ ...BaseResource, creator: user, name, parent: seq, order: k + 1, code: name })
        }
      }
    }
    await Block.ensureIndexes()
    return { chapter, user }
  }

  it('must return block resources in correct order', async()=> {
    const { chapter, user } = await ensureHierarchy()
    console.time('Get block resources', chapter, user)
    const resources=await getBlockResources({blockId: chapter._id, userId: user._id, allResources: true})
    console.timeEnd('Get block resources')
    const orders=await Promise.all(resources.map(async r => {
      const res=await Resource.findById(r)
      return parseInt(`${res.name}`)
    }))
    const sortedOrders=[...orders].sort()
    expect(sortedOrders).toEqual(orders)
  })

  it.only('must compute proper start order', async()=> {
    const {chapter, user}=await ensureHierarchy()
    await Progress.remove()
    const isFinishedBlock = async blockId => isFinished(user._id, blockId)
    const setBlockStatus = (blockId, status) => saveBlockStatus(user._id, blockId, status)
    const locGetBlockStatus = (blockId) => getBlockStatus(user._id, null, {_id: blockId})

    // Set seq 21 to order
    // await Block.findOneAndUpdate({name: /21 s/}, {closed: true})
    let resource=await Block.findOne({type: BLOCK_TYPE_RESOURCE, name: /211 r/})
    await saveBlockStatus(user._id, resource._id, BLOCK_STATUS_FINISHED)
    resource=await Block.findOne({type: BLOCK_TYPE_RESOURCE, name: /212 r/})
    await saveBlockStatus(user._id, resource._id, BLOCK_STATUS_FINISHED)
    
    await computeBlockStatus(chapter._id, isFinishedBlock, setBlockStatus, locGetBlockStatus)
    
    console.log(await Progress.find().populate('block').lean()
      .then(res => {
        res=lodash.sortBy(res, r => r.block.name)
        return res.map(r => JSON.stringify([r.block.name.padEnd(14), r.achievement_status]))})
    )
    console.log(user._id)
  })

})