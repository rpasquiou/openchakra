const { MongoMemoryServer }=require('mongodb-memory-server')
const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, putToDb } = require('../../server/utils/database')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Module = require('../../server/models/Module')
const Sequence = require('../../server/models/Sequence')
const { BaseResource, BaseBuilder, BaseModule, BaseSequence } = require('./baseData')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')
const { getBlockResources } = require('../../server/plugins/aftral-lms/resources')
const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')

jest.setTimeout(60*1000)

describe('Test attributes propagation', () => {

  let mongod

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri, MONGOOSE_OPTIONS)
    builder=await User.create({...BaseBuilder})
    resource = await Resource.create({ ...BaseResource, creator: builder })
    module = await Module.create({ ...BaseModule, creator: builder })
    sequence = await Sequence.create({ ...BaseSequence, creator: builder })
    await addChildAction({parent:sequence._id, child: resource._id}, builder)
    await addChildAction({parent:module._id, child: sequence._id}, builder)
  })

  let builder, resource, sequence, module 

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongod.stop()
  })

  it('Must propagate optional', async () => {
    let resources=await Resource.find()
    expect(resources.every(r => !r.optional)).toBe(true)
    // Set template optional
    await putToDb({model: 'resource', params:{optional: true}, id:resource._id})
    // Expect all dependants have become optional
    resources=await Resource.find().sort({[CREATED_AT_ATTRIBUTE]:1})
    expect(resources.map(r => !!r.optional)).toEqual([true, true, true])
    const sequenceResources=await getBlockResources(sequence)
    // Set sequenceresource optional
    await putToDb({model: 'resource', params:{optional: false}, id:sequenceResources[0]})
    // Expect module resource have becom optional
    resources=await Resource.find().sort({[CREATED_AT_ATTRIBUTE]:1})
    expect(resources.map(r => !!r.optional)).toEqual([true, false, false])
  })



})

