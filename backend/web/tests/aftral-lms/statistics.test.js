const moment = require('moment')
const mongoose = require('mongoose')
const { forceDataModelAftral } = require('../utils')
forceDataModelAftral()
const { MONGOOSE_OPTIONS, loadFromDb, callPostCreateData, idEqual } = require('../../server/utils/database')
const User = require('../../server/models/User')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
const { ROLE_CONCEPTEUR, ROLE_APPRENANT, ROLE_FORMATEUR, ACHIEVEMENT_RULE_SUCCESS, RESOURCE_TYPE_PDF, RESOURCE_TYPE_LINK, ACHIEVEMENT_RULE_CONSULT } = require('../../server/plugins/aftral-lms/consts')
require('../../server/plugins/aftral-lms/actions')
const Block = require('../../server/models/Block')
const { ACTIONS } = require('../../server/utils/studio/actions')
const { SseKmsEncryptedObjectsStatus } = require('@aws-sdk/client-s3')
const ProductCode = require('../../server/models/ProductCode')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')
require('../../server/models/Certification')
require('../../server/models/Feed')


describe('Test models computations', () => {
  let trainee1, trainee2, trainer, resource, sequence, modulee, program, session, productCode, conceptor, fields
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)

    conceptor = await User.create({
      firstname: `John`,
      lastname: `Doe`,
      role: ROLE_CONCEPTEUR,
      password: `Test`,
      email: `t@t.com`,
    })

    trainer = await User.create({
      firstname: `John`,
      lastname: `Doe`,
      email: `j.d@wappizy.com`,
      password: `test`,
      role: ROLE_FORMATEUR
    })

    trainee1 = await User.create({
      firstname: `Jeanette`,
      lastname: `Hillbilly`,
      email: `j.d@wappizy.com`,
      password: `test`,
      role: ROLE_APPRENANT
    })

    trainee2 = await User.create({
      firstname: `Billy`,
      lastname: `Jean`,
      email: `j.d@wappizy.com`,
      password: `test`,
      role: ROLE_APPRENANT
    })

    resource = await Block.create({
      name: `Res`,
      type: `resource`,
      resource_type:RESOURCE_TYPE_PDF,
      url: `test`,
      achievement_rule:ACHIEVEMENT_RULE_CONSULT,
      creator: trainer._id,
      homework_mode: true,
      success_note_min:0,
      success_note_max: 20,
    })

    session = await Session.create({
      name: `Test Session`,
      creator: trainer._id,
      start_date: new Date(`10-10-2024`),
      end_date: new Date(`10-10-2025`),
      trainees:[trainee1, trainee2],
      code: `test`,
      _locked: true,
    })

    productCode = await ProductCode.create({code:`Test product code`})

    program = await Program.create({
      name: `Test program`,
      codes:[productCode._id],
      creator: trainer._id
    })

    modulee = await Module.create({
      name: `Test module`,
      creator: trainer._id
    })

    sequence = await Sequence.create({
      name: `Test sequence`,
      creator: trainer._id
    })
    await addChildAction({parent: sequence._id, child: resource._id}, conceptor)
    await addChildAction({parent: modulee._id, child: sequence._id}, conceptor)
    await addChildAction({parent: program._id, child: modulee._id}, conceptor)
    await addChildAction({parent: session._id, child: program._id}, conceptor)

    fields =  [
      `sessions.trainees.fullname`,
      `sessions.trainees.statistics.children.name`,
      `sessions.trainees.statistics.children`,
      `sessions`,
      `sessions.trainees.statistics.children.children`,
      `sessions.trainees.statistics.children.children.name`,
      `sessions.trainees.statistics.evaluation_resources`,
      `sessions.trainees`,
      `sessions.children.evaluation_resources`
    ]
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it(`must return trainee's statistics`, async () => {
    const data = await loadFromDb({
      model: `statistics`,
      user: trainee1,
      id: trainee1._id,
      fields,
    })
    expect(data[0].sessions[0].trainees.length).toEqual(1)
    expect(idEqual(data[0].sessions[0].trainees[0]._id, trainee1._id)).toBeTruthy()
  })

  it(`must return all trainees statistics`, async () => {
    const data = await loadFromDb({
      model: `statistics`,
      user: trainer,
      fields,
    })
    expect(data[0].sessions[0].trainees.length).toEqual(2)
    expect(data[0].sessions[0].trainees[0].statistics.evaluation_resources.length).toEqual(1)
    expect(data[0].sessions[0].children[0].evaluation_resources.length).toEqual(1)
  })
})