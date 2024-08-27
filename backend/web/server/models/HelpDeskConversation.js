const {getDataModel}=require('../../config/config')

let HelpDeskConversation = null

try {
  const Conversation = require(`./Conversation`)
  if (Conversation) {
    const HelpDeskConversationSchema=require(`../plugins/${getDataModel()}/schemas/HelpDeskConversationSchema`)
    HelpDeskConversationSchema.plugin(require('mongoose-lean-virtuals'))
    HelpDeskConversation = Conversation.discriminator('helpDeskConversation', HelpDeskConversationSchema)
  }
}
catch (err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = HelpDeskConversation
