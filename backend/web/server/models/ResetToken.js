const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ResetTokenSchema=null

try {
  ResetTokenSchema=require(`../plugins/${getDataModel()}/schemas/ResetTokenSchema`)
  customizeSchema(ResetTokenSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ResetTokenSchema ? mongoose.model('resetToken', ResetTokenSchema) : null
