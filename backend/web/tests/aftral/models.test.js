const moment=require('moment')
const mongoose = require('mongoose')
const lodash=require('lodash')
const {forceDataModelAftral}=require('../utils')
forceDataModelAftral()
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const User=require('../../server/models/User')
const Resource=require('../../server/models/Resource')
const Sequence=require('../../server/models/Sequence')
const Module=require('../../server/models/Module')
const Program=require('../../server/models/Program')
const Session=require('../../server/models/Session')
const { ROLE_CONCEPTEUR, RESOURCE_TYPE, ROLE_APPRENANT } = require('../../server/plugins/aftral-lms/consts')
const { updateAllDurations, updateDuration } = require('../../server/plugins/aftral-lms/functions')
require('../../server/plugins/aftral-lms/actions')
const Block = require('../../server/models/Block')
const { ACTIONS } = require('../../server/utils/studio/actions')
const Duration = require('../../server/models/Duration')


jest.setTimeout(20000)

describe('Test models computations', () => {

  const RESOURCE_COUNT=1
  const RESOURCE_DURATION=20
  const SEQUENCE_COUNT=1
  const MODULE_COUNT=1
  const PROGRAM_COUNT=1

  let user
  let templateResource, templateSequence, templateModule, templateProgram, templateSession

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    user=await User.create({firstname: 'concepteur', lastname: 'concepteur', 
      email: 'hello+concepteur@wappizy.com', role: ROLE_CONCEPTEUR, password: 'p1'})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must create blocks', async() => {
    templateResource=await Resource.create({name: 'Ressource 1', duration:RESOURCE_DURATION, resource_type: Object.keys(RESOURCE_TYPE)[0], creator: user, url: 'url'})
    templateSequence=await Sequence.create({name: 'Séquence 1'})
    templateModule=await Module.create({name: 'Module 1'})
    templateProgram=await Program.create({name: 'Programme 1'})
    templateSession=await Session.create({name: 'Session 1', start_date: moment(), end_date: moment()})
    const blocks=await Block.countDocuments()
    expect(blocks).toEqual(5)
  })

  it('must affect blocks', async() => {
    const blocks=await Block.find()
    const grouped=lodash(blocks).groupBy('type').mapValues(v => v.map(obj => obj._id)[0]).value()
    const countBefore=await Block.countDocuments()
    expect(countBefore).toEqual(5)
    await ACTIONS.addChild({parent: templateSequence._id, child: templateResource._id}, user)
    await ACTIONS.addChild({parent: templateModule._id, child: templateSequence}, user)
    await ACTIONS.addChild({parent: templateProgram, child: templateModule}, user)
    await ACTIONS.addChild({parent: templateSession, child: templateProgram}, user)
    const countAfter=await Block.countDocuments()
    expect(countAfter).toEqual(9)
  })

  it('must compute childrenCount', async() => {
    const program= await Program.findOne().populate({path: 'children', populate:{path: 'children', populate: {path: 'children' }}})
    let data=[program]
    while (data.length>0) {
      let [first, ...rest]=data
      if (first.type!='resource') {
        expect(first.children.length).toEqual(1)
      }
      data=rest
    }
  })

  it('must compute durations', async() => {
    await updateAllDurations()
    const blocks=await Block.find()
    expect(blocks).toHaveLength(9)
    const EXPECTED={
      'resource': RESOURCE_DURATION,
      'sequence': RESOURCE_COUNT*RESOURCE_DURATION,
      'module': SEQUENCE_COUNT*RESOURCE_COUNT*RESOURCE_DURATION,
      'program': MODULE_COUNT*SEQUENCE_COUNT*RESOURCE_COUNT*RESOURCE_DURATION,
      'session': PROGRAM_COUNT*MODULE_COUNT*SEQUENCE_COUNT*RESOURCE_COUNT*RESOURCE_DURATION,
    }
    const durations=lodash(blocks)
      .groupBy('type')
      .mapValues(values => values.map(v => v.duration))
      .value()
    Object.entries(durations).forEach(([type, counts]) => expect(counts.every(e => e==EXPECTED[type])).toBe(true))

  })

  it('must compute program durations', async() => {
    const program = await Program.findOne()
    const res=await updateDuration(program)
    const programAfter = await Program.findOne()
    expect(res).toEqual(programAfter.duration)
    expect(programAfter.duration).toEqual(MODULE_COUNT*SEQUENCE_COUNT*RESOURCE_COUNT*RESOURCE_DURATION)
    expect(await Block.countDocuments()).toEqual(9)
  })

  it('must remove child properly', async() => {
    const countBefore=await Block.countDocuments()
    expect(countBefore).toEqual(9)
    let program=await Program.findOne()
    const parentId=program._id
    const childId=program.children[0]._id
    await ACTIONS.removeChild({parent: parentId, child: childId}, user)
    const countAfter=await Block.countDocuments()
    expect(countAfter).toEqual(8)
    program=await Program.findOne()
    expect(program.children).toHaveLength(0)
    await ACTIONS.addChild({parent: templateProgram._id, child: templateModule._id}, user)
    expect(await Block.countDocuments()).toEqual(9)
  })

  it('must count resources', async() => {
    const [program]=await loadFromDb({model: 'block', id: templateProgram._id, fields: ['resources_count', 'finished_resources_count'], user})
    expect(program.resources_count).toEqual(1)
    expect(program.finished_resources_count).toEqual(0)

    const blocks=await Block.find()
    await Promise.all(blocks.map(block => Duration.create({block, user, finished:true})))
    const [programAfter]=await loadFromDb({model: 'block', id: templateProgram._id, fields: ['resources_count', 'finished_resources_count'], user})
    expect(programAfter.resources_count).toEqual(1)
    expect(programAfter.finished_resources_count).toEqual(1)
  })
})
