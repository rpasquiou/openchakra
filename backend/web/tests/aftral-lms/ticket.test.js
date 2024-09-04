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
  let user, ticket, conversation, message, helpDesk, user2, ticket2, conversation2, message2, resource, sequence, conceptor, id
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

    conceptor = await User.create({
      firstname: `John`,
      lastname: `Doe`,
      role: ROLE_CONCEPTEUR,
      password: `Test`,
      email: `t@t.com`,
    })

    resource = await Block.create({
      name: `Res`,
      type: `resource`,
      resource_type:RESOURCE_TYPE_PDF,
      url: `test`,
      achievement_rule:ACHIEVEMENT_RULE_CONSULT,
      creator: user._id,
      homework_mode: true,
      success_note_min:0,
      success_note_max: 20,
    })

    sequence = await Sequence.create({
      name: `Test sequence`,
      creator: user._id
    })

    await addChildAction({parent: sequence._id, child: resource._id}, conceptor)

    helpDesk = await User.create({
      firstname: `Jeanette`,
      lastname: `Doe`,
      role: ROLE_HELPDESK,
      password: `Test`,
      email: `t@t.com`,
    })


    const [seq] = await loadFromDb({model: `block`, id:sequence._id, fields: [`children`]})
    id = seq.children[0]._id

    ticket = await Ticket.create({
      user: user._id,
      content: `content`,
      title: `Test ticket`,
      block: id
    })

    ticket2 = await Ticket.create({
      user: user2._id,
      content: `content2`,
      title: `Test ticket2`,
      block: resource._id
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

  it(`must return ticket count on cloned block`, async () => {
    const [data] = await loadFromDb({
      model: `block`,
      fields: [`tickets`, `tickets_count`],
      user: helpDesk,
      id
    })
    expect(data.tickets_count).toEqual(1)
  })
  it(`must return ticket count on origin block`, async () => {
    const [data] = await loadFromDb({
      model: `block`,
      fields: [`tickets`, `tickets_count`],
      user: helpDesk,
      id:resource._id
    })
    expect(data.tickets_count).toEqual(2)
  })
})