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
const { ROLE_CONCEPTEUR, RESOURCE_TYPE } = require('../../server/plugins/aftral-lms/consts')
const { updateAllDurations, updateDuration } = require('../../server/plugins/aftral-lms/functions')
const Block = require('../../server/models/Block')


jest.setTimeout(20000)

describe('Test models computations', () => {

  const RESOURCE_COUNT=3
  const RESOURCE_DURATION=2
  const SEQUENCE_COUNT=3
  const MODULE_COUNT=3

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    const user=await User.create({firstname: 'concepteur', lastname: 'concepteur', email: 'hello+concpteur@wappizy.com', role: ROLE_CONCEPTEUR, password: 'p1'})
    const resources=await Promise.all(lodash.range(RESOURCE_COUNT).map(idx => Resource.create(
      {name: `R${idx}`, code: `R${idx}`, creator: user, url: 'hop', resource_type: Object.keys(RESOURCE_TYPE)[0], 
      duration: RESOURCE_DURATION},
      )))
    const sequences=await Promise.all(lodash.range(SEQUENCE_COUNT).map(idx => Sequence.create({name: `S${idx}`, code: `S${idx}`, children: resources})))
    const modules=await Promise.all(lodash.range(MODULE_COUNT).map(idx => Module.create({name: `M${idx}`, code: `M${idx}`, children:sequences})))
    await Program.create({name: `P1`, code: `P1`, children:modules})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must compute childrenCount', async() => {
    const program= await Program.findOne().populate({path: 'children', populate:{path: 'children', populate: {path: 'children' }}})
    let data=[program]
    while (data.length>0) {
      let [first, ...rest]=data
      if (first.type!='resource') {
        expect(first.children.length).toEqual(3)
      }
      data=rest
    }
  })

  it('must compute duration', async() => {
    const programBefore = await Program.findOne()
    const duration=await updateDuration(programBefore)
    const programAfter = await Program.findOne()
    expect(programAfter.duration).toEqual(duration)
    expect(programAfter.duration).toEqual(MODULE_COUNT*SEQUENCE_COUNT*RESOURCE_COUNT*RESOURCE_DURATION)
  })

  it('must compute durations', async() => {
    await updateAllDurations()
    const blocks=await Block.find()
    const EXPECTED={
      'resource': RESOURCE_DURATION,
      'sequence': RESOURCE_COUNT*RESOURCE_DURATION,
      'module': SEQUENCE_COUNT*RESOURCE_COUNT*RESOURCE_DURATION,
      'program': MODULE_COUNT*SEQUENCE_COUNT*RESOURCE_COUNT*RESOURCE_DURATION,
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

  it('must check template name setting', async() => {
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
    expect(linked[0]?.name).toEqual(NAME2)
  })

})
