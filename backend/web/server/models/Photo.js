const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let PhotoSchema=null

try {
  PhotoSchema=require(`../plugins/${getDataModel()}/schemas/PhotoSchema`)
  customizeSchema(PhotoSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PhotoSchema ? mongoose.model('photo', PhotoSchema) : null
