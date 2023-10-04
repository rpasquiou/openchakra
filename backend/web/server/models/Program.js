const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ProgramSchema=null

try {
  ProgramSchema=require(`../plugins/${getDataModel()}/schemas/ProgramSchema`)
  customizeSchema(ProgramSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ProgramSchema ? mongoose.model('program', ProgramSchema) : null
