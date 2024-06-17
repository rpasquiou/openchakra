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
const { ROLE_CONCEPTEUR, RESOURCE_TYPE, ROLE_APPRENANT, ROLE_FORMATEUR } = require('../../server/plugins/aftral-lms/consts')
const { updateAllDurations, updateDuration, lockSession } = require('../../server/plugins/aftral-lms/functions')
require('../../server/plugins/aftral-lms/actions')
const Block = require('../../server/models/Block')
const { ACTIONS } = require('../../server/utils/studio/actions')
const Duration = require('../../server/models/Duration')
const { SseKmsEncryptedObjectsStatus } = require('@aws-sdk/client-s3')


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
