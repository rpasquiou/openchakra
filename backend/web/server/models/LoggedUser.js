const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let LoggedUserSchema=null

try {
  LoggedUserSchema=require(`../plugins/${getDataModel()}/schemas/UserSchema`)
  customizeSchema(LoggedUserSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = LoggedUserSchema ? mongoose.model('loggedUser', LoggedUserSchema) : null
