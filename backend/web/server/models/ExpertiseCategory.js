const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let ExpertiseCategorySchema=null

try {
  ExpertiseCategorySchema=require(`../plugins/${getDataModel()}/schemas/ExpertiseCategorySchema`)
  ExpertiseCategorySchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ExpertiseCategorySchema ? mongoose.model('expertiseCategory', ExpertiseCategorySchema) : null
