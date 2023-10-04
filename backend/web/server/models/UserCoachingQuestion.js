const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let UserCoachingQuestionSchema=null

try {
  UserCoachingQuestionSchema=require(`../plugins/${getDataModel()}/schemas/UserCoachingQuestionSchema`)
  customizeSchema(UserCoachingQuestionSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserCoachingQuestionSchema ? mongoose.model('userCoachingQuestion', UserCoachingQuestionSchema) : null
