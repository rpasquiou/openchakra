const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let UserSurveySchema=null

try {
  UserSurveySchema=require(`../plugins/${getDataModel()}/schemas/UserSurveySchema`)
  customizeSchema(UserSurveySchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserSurveySchema ? mongoose.model('userSurvey', UserSurveySchema) : null
