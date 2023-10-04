const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let UserQuizzQuestionsSchema=null

try {
  UserQuizzQuestionsSchema=require(`../plugins/${getDataModel()}/schemas/UserQuizzQuestionSchema`)
  customizeSchema(UserQuizzQuestionsSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserQuizzQuestionsSchema ? mongoose.model('userQuizzQuestion', UserQuizzQuestionsSchema) : null
