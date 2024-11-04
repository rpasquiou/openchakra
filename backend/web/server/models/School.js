const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let SchoolSchema=null

try {
  SchoolSchema=require(`../plugins/${getDataModel()}/schemas/SchoolSchema`)
  SchoolSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = SchoolSchema ? mongoose.model('school', SchoolSchema) : null