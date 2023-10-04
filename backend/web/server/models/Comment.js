const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let CommentSchema=null

try {
  CommentSchema=require(`../plugins/${getDataModel()}/schemas/CommentSchema`)
  customizeSchema(CommentSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CommentSchema ? mongoose.model('comment', CommentSchema) : null
