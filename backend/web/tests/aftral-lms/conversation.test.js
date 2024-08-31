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
const Conversation = require('../../server/models/Conversation')
const Message = require('../../server/models/Message')
const SessionConversation = require('../../server/models/SessionConversation')
require('../../server/models/Feed')
require('../../server/models/Certification')

jest.setTimeout(60000)

describe('User', () => {
  let trainer, trainee1, trainee2, session, conversation1, conversation2, message1, message2
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
      role: ROLE_APPRENANT,
      password: `Test`,
      email: `t@t.com`,
    })
    trainee2 = await User.create({
      firstname: `Jean`,
      lastname: `Doe`,
      role: ROLE_APPRENANT,
      password: `Test`,
      email: `t@t.com`,
    })

    session = await Session.create({
      name: `Test Session`,
      creator: trainer._id,
      start_date: new Date(`10-10-2024`),
      end_date: new Date(`10-10-2025`),
      trainees: [trainee1._id, trainee2._id],
      trainers: [trainer._id],
      _locked:true,
    })

    conversation1 = await SessionConversation.create({
      trainee:trainee1._id,
      session: session._id
    })

    conversation2 = await SessionConversation.create({
      trainee: trainee2._id,
      session: session._id
    })

    message1 = await Message.create({
      sender: trainee1._id,
      conversation: conversation1._id,
      content: `content1`,
    }) 

    message2 = await Message.create({
      sender: trainee2._id,
      conversation: conversation2._id,
      content: `content2`,
    }) 
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must return session conversation', async () => {
    const trainerData = await loadFromDb({
      model: `sessionConversation`,
      user: trainer,
      fields:[`messages`]
    })
    expect(trainerData.length).toEqual(2)
    const traineeData = await loadFromDb({
      model: `sessionConversation`,
      user: trainee1,
      fields:[`messages`,`trainee`]
    })
    // expect(traineeData.length).toEqual(1)

    const [sessionData] = await loadFromDb({
      model: `session`,
      user: trainee1,
      fields:[`conversations.messages`,`conversations.trainee`,`name`]
    })

    expect(sessionData.conversations.length).toEqual(1)
  })
})