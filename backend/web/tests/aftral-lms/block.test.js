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
const { ROLE_APPRENANT, ROLE_FORMATEUR, RESOURCE_TYPE_PDF, ACHIEVEMENT_RULE_CHECK, ACHIEVEMENT_RULE_SUCCESS, ACHIEVEMENT_RULE_CONSULT, RESOURCE_TYPE_VIDEO, ACHIEVEMENT_RULE_DOWNLOAD, ROLE_CONCEPTEUR, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_UNAVAILABLE } = require('../../server/plugins/aftral-lms/consts')
const Block = require('../../server/models/Block')
const Homework = require('../../server/models/Homework')
const Progress = require('../../server/models/Progress')

jest.setTimeout(60000)

describe('User', () => {
  let trainer, trainee1, trainee2, homework1, homework2, block, progress1, progress2
  let limit = new Date('06-06-2022')
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-test`, MONGOOSE_OPTIONS)
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
      creator: trainer._id,
      homework_limit_date: limit,
      homework_mode: true,
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
    progress1 = await Progress.create({
      user:trainee1._id,
      block:block._id,
      homeworks:[homework1._id]
    })
    progress2 = await Progress.create({
      user:trainee2._id,
      block:block._id,
      homeworks:[homework2._id]
    })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it.only('must return block homeworks attributes', async()=> {
    const [result] = await loadFromDb({model:`block`,user:trainee1._id, fields:[`can_upload_homework`,`homeworks`]})
    expect(result.can_upload_homework).not.toBeTruthy()
    expect(result.homeworks.length).toEqual(1)
    expect(idEqual(result.homeworks[0]._id,homework1._id)).toBeTruthy()
  })
})