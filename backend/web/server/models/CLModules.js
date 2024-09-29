const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let CLModuleSchema=null

try {
  CLModuleSchema=require(`../plugins/${getDataModel()}/schemas/CLModuleSchema`)
  CLModuleSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CLModuleSchema ? mongoose.model('cLModule', CLModuleSchema) : null
