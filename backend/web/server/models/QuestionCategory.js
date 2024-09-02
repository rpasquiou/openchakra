const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let QuestionCategorySchema=null

try {
  QuestionCategorySchema=require(`../plugins/${getDataModel()}/schemas/QuestionCategorySchema`)
  QuestionCategorySchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = QuestionCategorySchema ? mongoose.model('album', QuestionCategorySchema) : null