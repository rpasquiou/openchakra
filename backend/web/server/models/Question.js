const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let QuestionSchema=null

try {
  QuestionSchema=require(`../plugins/${getDataModel()}/schemas/QuestionSchema`)
  customizeSchema(QuestionSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = QuestionSchema ? mongoose.model('question', QuestionSchema) : null
