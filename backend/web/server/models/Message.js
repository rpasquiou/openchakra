const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let MessageSchema=null

try {
  MessageSchema=require(`../plugins/${getDataModel()}/schemas/MessageSchema`)
  customizeSchema(MessageSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = MessageSchema ? mongoose.model('message', MessageSchema) : null
