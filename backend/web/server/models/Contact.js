const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ContactSchema=null

try {
  ContactSchema=require(`../plugins/${getDataModel()}/schemas/ContactSchema`)
  customizeSchema(ContactSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ContactSchema ? mongoose.model('contact', ContactSchema) : null
