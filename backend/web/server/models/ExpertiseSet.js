const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ExpertiseSetSchema=null

try {
  ExpertiseSetSchema=require(`../plugins/${getDataModel()}/schemas/ExpertiseSetSchema`)
  ExpertiseSetSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ExpertiseSetSchema ? mongoose.model('expertiseSet', ExpertiseSetSchema) : null