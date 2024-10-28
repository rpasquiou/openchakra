const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let DocumentSchema=null

try {
  DocumentSchema=require(`../plugins/${getDataModel()}/schemas/DocumentSchema`)
  DocumentSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = DocumentSchema ? mongoose.model('document', DocumentSchema) : null
