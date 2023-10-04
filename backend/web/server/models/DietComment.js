const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let DietCommentSchema=null

try {
  DietCommentSchema=require(`../plugins/${getDataModel()}/schemas/DietCommentSchema`)
  customizeSchema(DietCommentSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = DietCommentSchema ? mongoose.model('dietComment', DietCommentSchema) : null
