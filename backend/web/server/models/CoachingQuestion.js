const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let CoachingQuestionSchema=null

try {
  CoachingQuestionSchema=require(`../plugins/${getDataModel()}/schemas/CoachingQuestionSchema`)
  customizeSchema(CoachingQuestionSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CoachingQuestionSchema ? mongoose.model('coachingQuestion', CoachingQuestionSchema) : null
