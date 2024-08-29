const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb, idEqual } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
require('../../server/models/Certification')
require('../../server/models/Permission')
require('../../server/models/PermissionGroup')
const { ROLE_APPRENANT, ROLE_FORMATEUR, RESOURCE_TYPE_PDF, ACHIEVEMENT_RULE_CHECK, ACHIEVEMENT_RULE_SUCCESS, ACHIEVEMENT_RULE_CONSULT, RESOURCE_TYPE_VIDEO, ACHIEVEMENT_RULE_DOWNLOAD, ROLE_CONCEPTEUR, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_UNAVAILABLE, ACHIEVEMENT_RULE } = require('../../server/plugins/aftral-lms/consts')
const Block = require('../../server/models/Block')
const Homework = require('../../server/models/Homework')
const Progress = require('../../server/models/Progress')
const ProductCode = require('../../server/models/ProductCode')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')
require('../../server/models/Feed')
require('../../server/models/Certification')

jest.setTimeout(60000)

describe('User', () => {
  let trainer, trainee1, trainee2, homework1, homework2, block, progress1, progress2, sequence, modulee, program, session, productCode, conceptor, id
  let limit = new Date('06-06-2025')
  let sequenceId
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-test`, MONGOOSE_OPTIONS)
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
      role: ROLE_FORMATEUR,
      password: `Test`,
      email: `t@t.com`,
    })
    trainee1 = await User.create({
      firstname: `Jeanette`,
      lastname: `Doe`,
      role: ROLE_FORMATEUR,
      password: `Test`,
      email: `t@t.com`,
    })
    trainee2 = await User.create({
      firstname: `Jean`,
      lastname: `Doe`,
      role: ROLE_FORMATEUR,
      password: `Test`,
      email: `t@t.com`,
    })
    block = await Block.create({
      name: `Res`,
      type: `resource`,
      resource_type:RESOURCE_TYPE_PDF,
      url: `test`,
      achievement_rule:ACHIEVEMENT_RULE_CONSULT,
      creator: trainer._id,
      homework_limit_date: limit,
      homework_mode: true,
      success_note_min:0,
      success_note_max: 20,
    })
    homework1 = await Homework.create({
      document: `t`,
      resource: block._id,
      trainee: trainee1._id,
    })
    homework2 = await Homework.create({
      document: `t`,
      resource: block._id,
      trainee: trainee2._id,
    })
    session = await Session.create({
      name: `Test Session`,
      creator: trainer._id,
      start_date: new Date(`10-10-2024`),
      end_date: new Date(`10-10-2025`),
      trainees:[trainee1._id, trainee2._id]
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
    }),
    sequence = await Sequence.create({
      name: `Test sequence`,
      creator: trainer._id
    })

    await addChildAction({parent: session._id, child: program._id}, conceptor)
    await addChildAction({parent: program._id, child: modulee._id}, conceptor)
    await addChildAction({parent: modulee._id, child: sequence._id}, conceptor)
    await addChildAction({parent: sequence._id, child: block._id}, conceptor)

    const [ses] = await loadFromDb({model: `session`, user:conceptor, fields:[`children.children.children.children`]})
    id = ses.children[0].children[0].children[0].children[0]._id
    sequenceId = ses.children[0].children[0].children[0]._id

    progress1 = await Progress.create({
      user:trainee1._id,
      block:id,
      homeworks:[homework1._id],
      achievement_status: BLOCK_STATUS_FINISHED,
    })
    progress2 = await Progress.create({
      user:trainee2._id,
      block:id,
      homeworks:[homework2._id]
    })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return block homeworks attributes', async()=> {
    const [result] = await loadFromDb({model:`block`,user:trainee1._id, id, fields:[`can_upload_homework`,`homeworks`]})
    expect(result.can_upload_homework).toBeTruthy()
    expect(result.homeworks.length).toEqual(1)
    expect(idEqual(result.homeworks[0]._id,homework1._id)).toBeTruthy()
  })

  it('must return homeworks of a session', async() => {
    const [data] = await loadFromDb({model:`block`, id:session._id, user:trainer, fields:[
      `children.children.children.children.success_note_min`
    ]})
    expect(data.children[0].children[0].children[0].children[0].success_note_min).toEqual(0)
  })

  it('must return homeworks submitted count', async() => {
    const [data] = await loadFromDb({model:`block`, user:conceptor, id, fields:[`session`,`homeworks_missing_count`,`homeworks`,`homeworks_submitted_count`,`trainees_count`]})
    expect(data.homeworks_missing_count).toEqual(0)
    expect(data.homeworks_submitted_count).toEqual(2)
    expect(data.trainees_count).toEqual(2)
  })

  it(`must return block's finished children for user`, async() => {
    const [data] = await loadFromDb({model: `block`, user:trainee1._id, id:sequenceId, fields:[`finished_children.children.name`,`finished_children.name`,`name`]})
    expect(data.finished_children.length).toEqual(1)
    expect(idEqual(data.finished_children[0]._id, id)).toBeTruthy()
  })

  it('must stop creating two blocks with the same name', async () => {
    await Block.create({
      name: `Test block`,
      creator: conceptor._id,
      type: `resource`,
      resource_type: RESOURCE_TYPE_PDF,
      url: `url`,
      achievement_rule: ACHIEVEMENT_RULE_CONSULT,
    })
    let error = null
  
    try {
      await Block.create({
        name: `Test block`,
        creator: conceptor._id,
        type: `resource`,
        resource_type: RESOURCE_TYPE_PDF,
        url: `url`,
        achievement_rule: ACHIEVEMENT_RULE_CONSULT,
      })
    } catch (e) {
      error = e
    }

    await Block.create({
      name: `Test block`,
      creator: conceptor._id,
      type: `module`,
    })

    expect(error).toBeDefined()
  })
})