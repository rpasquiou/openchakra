const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let UserQuestionSchema=null

try {
  UserQuestionSchema=require(`../plugins/${getDataModel()}/schemas/UserQuestionSchema`)
  customizeSchema(UserQuestionSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserQuestionSchema ? mongoose.model('userQuestion', UserQuestionSchema) : null
