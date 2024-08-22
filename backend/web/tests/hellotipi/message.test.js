const mongoose = require('mongoose')
const { MONGOOSE_OPTIONS, loadFromDb, idEqual } = require('../../server/utils/database')
const User = require('../../server/models/User')
const { ROLE_TI, ROLE_ALLE_ADMIN, COACHING, DEPARTEMENTS } = require('../../server/plugins/all-inclusive/consts')
const Message = require('../../server/models/Message')
require('../../server/plugins/all-inclusive/functions')

describe('Conversation and message', () => {
  let receiver, sender, message1, message2
  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/tipi-test}`, MONGOOSE_OPTIONS)
    receiver = await User.create({
      firstname:'John',
      lastname:'Doe',
      email:'john.doe@wappizy.com',
      password:'hi',
      role:ROLE_ALLE_ADMIN,
      city:'Rouen',
      zip_code:DEPARTEMENTS[0],
      address:'somewhere',
      coaching:COACHING[0],
      birthday:new Date('01-01-1960'),
      phone:'0606060606',
      cguAccepted:true,
    })
    sender = await User.create({
      firstname:'Jeanette',
      lastname:'Doe',
      email:'jeanette.doe@wappizy.com',
      password:'hi',
      role:ROLE_ALLE_ADMIN,
      zip_code:DEPARTEMENTS[0],
      coaching:COACHING[0]
    })
    message1 = await Message.create({
      content: 'Test content',
      sender:sender._id,
      receiver:receiver._id,
    })
    message2 = await Message.create({
      content: 'Test content 2',
      sender:sender._id,
      receiver:receiver._id,
    })
  })
  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })
  it('must return mine on message', async () => {
    const [message] = await loadFromDb({model:'message', user:sender, fields:['mine']})
    expect(message.mine).toBeTruthy()
  })
  it.only('must return newest message', async() => {
    const [conversation] = await loadFromDb({model:'conversation', user:sender, id:receiver._id, fields:['messages','newest_message']})
    expect(idEqual(conversation.newest_message[0]._id,message2._id)).toBeTruthy()
  })
})