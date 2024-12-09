const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let AttachmentSchema=null

try {
  AttachmentSchema=require(`../plugins/${getDataModel()}/schemas/AttachmentSchema`)
  AttachmentSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AttachmentSchema ? mongoose.model('attachment', AttachmentSchema) : null