const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ScanSchema=null

try {
  ScanSchema=require(`../plugins/${getDataModel()}/schemas/ScanSchema`)
  ScanSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ScanSchema ? mongoose.model('scan', ScanSchema) : null