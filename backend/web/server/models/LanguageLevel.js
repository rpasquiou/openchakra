const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let LanguageLevelSchema=null

try {
  LanguageLevelSchema=require(`../plugins/${getDataModel()}/schemas/LanguageLevelSchema`)
  LanguageLevelSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = LanguageLevelSchema ? mongoose.model('languageLevel', LanguageLevelSchema) : null
