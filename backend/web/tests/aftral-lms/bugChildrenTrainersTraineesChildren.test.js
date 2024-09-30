const moment=require('moment')
const mongoose = require('mongoose')
const lodash=require('lodash')
const {forceDataModelAftral}=require('../utils')
forceDataModelAftral()
const {MONGOOSE_OPTIONS, loadFromDb} = require('../../server/utils/database')
const User=require('../../server/models/User')
const { ROLE_FORMATEUR } = require('../../server/plugins/aftral-lms/consts')
require('../../server/plugins/aftral-lms/actions')


jest.setTimeout(20000)

describe('Test models computations', () => {

  const RESOURCE_COUNT=1
  const RESOURCE_DURATION=20
  const SEQUENCE_COUNT=1
  const MODULE_COUNT=1
  const PROGRAM_COUNT=1

  let designer, trainer
  let templateResource, templateSequence, templateModule, templateProgram, templateSession

  const ALL_FIELDS=`trainees.firstname,trainees.email,children.children.name,children.children.children_count,children.children.children.name,children.children.children.children.code,children.children.children.children.name,children.children.children,name,trainees,trainees.lastname,children.children.duration_str,children.children.children.children,children.children.children.children.duration_str,children,trainees.picture,children.children,children.name`.split(',')
  const FIELDS_WHITHOUT_TRAINEE=ALL_FIELDS.filter(f => !/trainee/i.test(f))

  console.log(ALL_FIELDS.length, FIELDS_WHITHOUT_TRAINEE.length)
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.close()
  })

  it('must load children only', async() => {
    const trainer=await User.findOne({role: ROLE_FORMATEUR})
    const data=await loadFromDb( {model: 'session', fields: FIELDS_WHITHOUT_TRAINEE, id:'65aa4832e4b5867f2962030a', user: trainer})
    console.log(data)
  })

  it.only('must load children and trainees', async() => {
    const trainer=await User.findOne({role: ROLE_FORMATEUR})
    const data=await loadFromDb( {model: 'session', fields: ALL_FIELDS, id:'65aa4832e4b5867f2962030a', user: trainer})
    expect(data[0].children[0]?.children).toBeTruthy()
  })

})
