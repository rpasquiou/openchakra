const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let UserSchema=null

try {
  UserSchema=require(`../plugins/${getDataModel()}/schemas/UserSchema`)
  customizeSchema(UserSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserSchema ? mongoose.model('user', UserSchema) : null
