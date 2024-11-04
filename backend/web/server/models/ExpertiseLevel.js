const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ExpertiseLevelSchema=null

try {
    ExpertiseLevelSchema=require(`../plugins/${getDataModel()}/schemas/ExpertiseLevelSchema`)
    ExpertiseLevelSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ExpertiseLevelSchema ? mongoose.model('expertiseLevel', ExpertiseLevelSchema) : null
