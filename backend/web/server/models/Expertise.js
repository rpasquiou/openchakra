const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ExpertiseSchema=null

try {
  ExpertiseSchema=require(`../plugins/${getDataModel()}/schemas/ExpertiseSchema`)
  ExpertiseSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ExpertiseSchema ? mongoose.model('expertise', ExpertiseSchema) : null
