const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let SoftwareSchema=null

try {
  SoftwareSchema=require(`../plugins/${getDataModel()}/schemas/SoftwareSchema`)
  SoftwareSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = SoftwareSchema ? mongoose.model('software', SoftwareSchema) : null
