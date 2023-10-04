const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let SpecificitySchema=null

try {
  SpecificitySchema=require(`../plugins/${getDataModel()}/schemas/SpecificitySchema`)
  customizeSchema(SpecificitySchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = SpecificitySchema ? mongoose.model('specificity', SpecificitySchema) : null
