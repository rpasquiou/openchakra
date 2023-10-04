const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let UserQuizzSchema=null

try {
  UserQuizzSchema=require(`../plugins/${getDataModel()}/schemas/UserQuizzSchema`)
  customizeSchema(UserQuizzSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserQuizzSchema ? mongoose.model('userQuizz', UserQuizzSchema) : null
