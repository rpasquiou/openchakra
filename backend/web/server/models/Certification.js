const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let CertificationSchema=null

try {
  CertificationSchema=require(`../plugins/${getDataModel()}/schemas/CertificationSchema`)
  CertificationSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CertificationSchema ? mongoose.model('certification', CertificationSchema) : null
