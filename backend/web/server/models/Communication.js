const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let CommunicationSchema=null

try {
  CommunicationSchema=require(`../plugins/${getDataModel()}/schemas/CommunicationSchema`)
  CommunicationSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CommunicationSchema ? mongoose.model('communication', CommunicationSchema) : null
