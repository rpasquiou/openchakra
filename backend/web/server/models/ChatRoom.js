const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ChatRoomSchema=null

try {
  ChatRoomSchema=require(`../plugins/${getDataModel()}/schemas/ChatRoomSchema`)
  customizeSchema(ChatRoomSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ChatRoomSchema ? mongoose.model('chatRoom', ChatRoomSchema) : null
