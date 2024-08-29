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
const { ROLE_APPRENANT, ROLE_FORMATEUR, RESOURCE_TYPE_PDF, ACHIEVEMENT_RULE_CHECK, ACHIEVEMENT_RULE_SUCCESS, ACHIEVEMENT_RULE_CONSULT, RESOURCE_TYPE_VIDEO, ACHIEVEMENT_RULE_DOWNLOAD, ROLE_CONCEPTEUR, BLOCK_STATUS_CURRENT, BLOCK_STATUS_FINISHED, BLOCK_STATUS_UNAVAILABLE, ACHIEVEMENT_RULE, ROLE_HELPDESK } = require('../../server/plugins/aftral-lms/consts')
const Block = require('../../server/models/Block')
const Homework = require('../../server/models/Homework')
const Progress = require('../../server/models/Progress')
const ProductCode = require('../../server/models/ProductCode')
const { addChildAction } = require('../../server/plugins/aftral-lms/actions')
const HelpDeskConversation = require('../../server/models/HelpDeskConversation')
const Ticket = require('../../server/models/Ticket')
const Message = require('../../server/models/Message')
require('../../server/models/Feed')
require('../../server/models/Certification')

describe(`Ticket`, () => {
  let user, ticket, conversation, message, helpDesk
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-test`, MONGOOSE_OPTIONS)

    user = await User.create({
      firstname: `John`,
      lastname: `Doe`,
      role: ROLE_CONCEPTEUR,
      password: `Test`,
      email: `t@t.com`,
    })

    helpDesk = await User.create({
      firstname: `Jeanette`,
      lastname: `Doe`,
      role: ROLE_HELPDESK,
      password: `Test`,
      email: `t@t.com`,
    })

    ticket = await Ticket.create({
      user: user._id,
      content: `content`,
      title: `Test ticket`
    })

    conversation = await HelpDeskConversation.create({
      user: user._id,
      ticket: ticket._id
    })

    ticket.conversation = conversation._id
    await ticket.save()

    message = await Message.create({
      conversation: conversation._id,
      sender: user._id,
      content: `Test message`
    })
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it(`must return ticket conversation messages`, async() => {
    const [data] = await loadFromDb({
      model: `ticket`,
      fields: [`conversation.messages`]
    })
    expect(data.conversation.messages[0].content).toEqual(`Test message`)
  })
})