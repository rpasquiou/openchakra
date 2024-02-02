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


describe('Test models computations', () => {

  let designer;
  let trainer

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
    designer=await User.create({firstname: 'concepteur', lastname: 'concepteur', 
      email: 'hello+concepteur@wappizy.com', role: ROLE_CONCEPTEUR, password: 'p1'})
    trainer=await User.create({firstname: 'formateur', lastname: 'formateur', 
      email: 'hello+formateur@wappizy.com', role: ROLE_FORMATEUR, password: 'p1'})
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must tell if resource is mine', async() => {
    const designer_resource=await Resource.create({name: 'Ressource designer', duration:10, resource_type: Object.keys(RESOURCE_TYPE)[0], creator: designer, url: 'url'})
    const trainer_resource=await Resource.create({name: 'Ressource formateur', duration:10, resource_type: Object.keys(RESOURCE_TYPE)[0], creator: trainer, url: 'url'})
    const designer_load=await loadFromDb({model: 'resource', fields: ['name', 'mine'], user: designer})
    const trainer_load=await loadFromDb({model: 'resource', fields: ['name','mine'], user: trainer})
    expect(designer_load).toHaveLength(1)
    expect(designer_load[0].mine).toBe(true)
    expect(trainer_load).toHaveLength(2)
    expect(trainer_load.find(r => /format/i.test(r.name)).mine).toBe(true)
    expect(trainer_load.find(r => /desig/i.test(r.name)).mine).toBe(false)
  })

})
