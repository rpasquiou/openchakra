const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let InstrumentSchema=null

try {
  InstrumentSchema=require(`../plugins/${getDataModel()}/schemas/InstrumentSchema`)
  customizeSchema(InstrumentSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = InstrumentSchema ? mongoose.model('instrument', InstrumentSchema) : null
