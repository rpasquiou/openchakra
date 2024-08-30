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
  let user, ticket, conversation, message, helpDesk, user2, ticket2, conversation2, message2
  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/aftral-test`, MONGOOSE_OPTIONS)

    user = await User.create({
      firstname: `John`,
      lastname: `Doe`,
      role: ROLE_APPRENANT,
      password: `Test`,
      email: `t@t.com`,
    })

    user2 = await User.create({
      firstname: `Jonn`,
      lastname: `Doe`,
      role: ROLE_APPRENANT,
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

    ticket2 = await Ticket.create({
      user: user2._id,
      content: `content2`,
      title: `Test ticket2`
    })

    conversation = await HelpDeskConversation.create({
      user: user._id,
      ticket: ticket._id
    })
    
    conversation2 = await HelpDeskConversation.create({
      user: user2._id,
      ticket: ticket2._id
    })

    ticket.conversation = [conversation._id]
    ticket2.conversation = [conversation2._id]
    await ticket.save()
    await ticket2.save()

    message = await Message.create({
      conversation: conversation._id,
      sender: user._id,
      content: `Test message`
    })

    message2 = await Message.create({
      conversation: conversation2._id,
      sender: user2._id,
      content: `Test message 2`
    })
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it(`must return all ticket conversation for helpDesk`, async() => {
    const data = await loadFromDb({
      model: `ticket`,
      fields: [`conversation.messages`],
      user: helpDesk
    })
    expect(data.length).toEqual(2)
  })

  it(`must return my tickets if not concepteur or helpDesk`, async () => {
    const data = await loadFromDb({
      model: `ticket`,
      fields: [`conversation.messages`],
      user: user
    })
    expect(data.length).toEqual(1)
  })
})