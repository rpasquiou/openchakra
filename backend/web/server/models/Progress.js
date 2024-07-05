const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

letProgressSchema=null

try {
    ProgressSchema=require(`../plugins/${getDataModel()}/schemas/ProgressSchema`)
    ProgressSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ProgressSchema ? mongoose.model('progress', ProgressSchema) : null
