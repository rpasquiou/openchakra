const {getDataModel}=require('../../config/config')

let SessionConversation = null

try {
  const Conversation = require(`./Conversation`)
  if (Conversation) {
    const SessionConversationSchema=require(`../plugins/${getDataModel()}/schemas/SessionConversationSchema`)
    SessionConversationSchema.plugin(require('mongoose-lean-virtuals'))
    SessionConversation = Conversation.discriminator('sessionConversation', SessionConversationSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = SessionConversation
