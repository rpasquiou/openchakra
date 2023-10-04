const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let QuizzSchema=null

try {
  QuizzSchema=require(`../plugins/${getDataModel()}/schemas/QuizzSchema`)
  customizeSchema(QuizzSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = QuizzSchema ? mongoose.model('quizz', QuizzSchema) : null
