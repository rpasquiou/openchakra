const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let ConversationSchema=null

try {
  ConversationSchema=require(`../plugins/${getDataModel()}/schemas/ConversationSchema`)
  customizeSchema(ConversationSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ConversationSchema ? mongoose.model('conversation', ConversationSchema) : null
