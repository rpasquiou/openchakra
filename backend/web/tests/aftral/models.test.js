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


jest.setTimeout(20000)

describe('Test models computations', () => {

  const RESOURCE_COUNT=1
  const RESOURCE_DURATION=20
  const SEQUENCE_COUNT=1
  const MODULE_COUNT=1
  const PROGRAM_COUNT=1

  let user
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
    await Resource.create({name: 'Ressource 1', duration:RESOURCE_DURATION, resource_type: Object.keys(RESOURCE_TYPE)[0], creator: user, url: 'url'})
    await Sequence.create({name: 'Séquence 1'})
    await Module.create({name: 'Module 1'})
    await Program.create({name: 'Programme 1'})
    await Session.create({name: 'Session 1', start_date: moment(), end_date: moment()})
    const blocks=await Block.countDocuments()
    expect(blocks).toEqual(5)
  })

  it('must affect blocks', async() => {
    const blocks=await Block.find()
    const grouped=lodash(blocks).groupBy('type').mapValues(v => v.map(obj => obj._id)[0]).value()
    const countBefore=await Block.countDocuments()
    expect(countBefore).toEqual(5)
    await ACTIONS.addChild({parent: grouped.sequence, child: grouped.resource}, user)
    await ACTIONS.addChild({parent: grouped.module, child: grouped.sequence}, user)
    await ACTIONS.addChild({parent: grouped.program, child: grouped.module}, user)
    await ACTIONS.addChild({parent: grouped.session, child: grouped.program}, user)
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
  })

  it.skip('must check template name setting', async() => {
    const NAME1='template'
    const NAME2='template2'
    const template=await Module.create({name: NAME1})
    let linked=await Module.create({origin: template})
    expect(linked.name).toEqual(NAME1)
    template.name=NAME2
    await template.save()
    //linked=await Module.findById(linked._id)//.populate('origin')
    const user=await User.findOne()
    linked=await loadFromDb({model: 'module', id: linked._id, fields: ['name'], user})
    await template.delete()
    await linked.delete()
    expect(linked[0]?.name).toEqual(NAME2)
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
  })
})
