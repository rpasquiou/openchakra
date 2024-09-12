const mongoose = require('mongoose')
const moment = require('moment')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const {BaseBuilder, BaseResource, BaseSequence, BaseModule}=require('./baseData')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const { BLOCK_STATUS_FINISHED } = require('../../server/plugins/aftral-lms/consts')
const Progress = require('../../server/models/Progress')
require('../../server/models/Certification')
require('../../server/models/Feed')
require('../../server/models/Feed')


jest.setTimeout(600000)

describe('Test sequence progress bug', () => {

  let creator

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    creator=await User.create({...BaseBuilder})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must load proper sequence', async() => {
    const module=await Module.create({...BaseModule, creator})
    const sequence=await Sequence.create({...BaseSequence, creator, parent: module, order:1})
    const res1=await Resource.create({...BaseResource, creator, parent: sequence, order:1})
    await Progress.create({user: creator, block: res1, achievement_status: BLOCK_STATUS_FINISHED})
    const loadedModule=await loadFromDb({
      model: 'block', id: module._id, 
      user: creator, fields: ['resources_progress', 'resources_count']
    })
    expect(loadedModule?.[0]?.resources_progress).toEqual(1)
    expect(loadedModule?.[0]?.resources_count).toEqual(1)
    const loadedSequence=await loadFromDb({
      model: 'block', id: sequence._id, 
      user: creator, fields: ['resources_progress', 'resources_count']
    })
    expect(loadedSequence?.[0]?.resources_progress).toEqual(1)
    expect(loadedSequence?.[0]?.resources_count).toEqual(1)
  })


})
