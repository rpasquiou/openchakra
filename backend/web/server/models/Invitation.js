const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let InvitationSchema=null

try {
  InvitationSchema=require(`../plugins/${getDataModel()}/schemas/InvitationSchema`)
  customizeSchema(InvitationSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = InvitationSchema ? mongoose.model('invitation', InvitationSchema) : null
