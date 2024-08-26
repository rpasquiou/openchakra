const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb } = require('../../server/utils/database')
require('../../server/plugins/aftral-lms/functions')
const User = require('../../server/models/User')
const Resource = require('../../server/models/Resource')
const Sequence = require('../../server/models/Sequence')
const Module = require('../../server/models/Module')
const Program = require('../../server/models/Program')
const Session = require('../../server/models/Session')
const ProductCode = require('../../server/models/ProductCode')
const Block = require('../../server/models/Block')
const { ROLE_APPRENANT, ROLE_FORMATEUR } = require('../../server/plugins/aftral-lms/consts')
const moment = require('moment')
const Group = require('../../server/models/Group')
const { preCreate, prePut } = require('../../server/plugins/aftral-lms/functions')
require('../../server/models/Certification')
require('../../server/models/Permission')
require('../../server/models/PermissionGroup')
require('../../server/models/Feed')

describe('Groups', () => {
  let user, group, session1, session2, session3, trainee1, trainee2, trainee3, trainee4, trainee5, trainee6, trainee7, trainee8
  let params
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-test`, MONGOOSE_OPTIONS)
    user = await User.create({
      firstname: `John`,
      lastname: `Doe`,
      role: ROLE_FORMATEUR,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    trainee1 = await User.create({
      firstname: `Jeanette1`,
      lastname: `Doe1`,
      role: ROLE_APPRENANT,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    trainee2 = await User.create({
      firstname: `Jeanette2`,
      lastname: `Doe2`,
      role: ROLE_APPRENANT,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    trainee3 = await User.create({
      firstname: `Jeanette3`,
      lastname: `Doe3`,
      role: ROLE_APPRENANT,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    trainee4 = await User.create({
      firstname: `Jeanette4`,
      lastname: `Doe4`,
      role: ROLE_APPRENANT,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    trainee5 = await User.create({
      firstname: `Jeanette5`,
      lastname: `Doe5`,
      role: ROLE_APPRENANT,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    trainee6 = await User.create({
      firstname: `Jeanette6`,
      lastname: `Doe6`,
      role: ROLE_APPRENANT,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    trainee7 = await User.create({
      firstname: `Jeanette7`,
      lastname: `Doe7`,
      role: ROLE_APPRENANT,
      email: `j.d@wappizy.com`,
      password: `J'aime la tartiflette312`,
    })
    session1 = await Session.create({
      name: `Test session1`,
      creator: user._id,
      start_date: new Date(`2024-10-10`),
      end_date: new Date(`2025-10-10`),
      trainees: [trainee1._id, trainee2._id], 
    })
    session2 = await Session.create({
      name: `Test session2`,
      creator: user._id,
      start_date: new Date(`2024-10-10`),
      end_date: new Date(`2025-10-10`),
      trainees: [trainee3._id, trainee4._id]
    })
    session3 = await Session.create({
      name: `Test session3`,
      creator: user._id,
      start_date: new Date(`2024-10-10`),
      end_date: new Date(`2025-10-10`),
      trainees: [trainee5._id, trainee6._id, trainee1._id]
    })
    group = await Group.create({
      user: user._id,
      can_post: true,
      name: `Test group`,
      sessions: [session1._id, session2._id],
      trainees: [trainee1._id,trainee2._id,trainee3._id,trainee4._id]
    })
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return group feed', async() => {
    const [data] = await loadFromDb({model: `group`, user, fields: [`trainees`, `sessions.trainees`]})
    // console.log(JSON.stringify(data.sessions, null, 2))
    // await preCreate({model: `group`, user, params})
    await prePut({model: `group`, user, id:group._id, params:{sessions:[session2._id, session3._id],creator:user._id}})
    expect(data.trainees.length).toEqual(4)
  })
})