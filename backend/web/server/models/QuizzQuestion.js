const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let QuizzQuestionSchema=null

try {
  QuizzQuestionSchema=require(`../plugins/${getDataModel()}/schemas/QuizzQuestionSchema`)
  customizeSchema(QuizzQuestionSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = QuizzQuestionSchema ? mongoose.model('quizzQuestion', QuizzQuestionSchema) : null
