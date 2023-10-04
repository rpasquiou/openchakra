const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let PipSchema=null

try {
  PipSchema=require(`../plugins/${getDataModel()}/schemas/PipSchema`)
  customizeSchema(PipSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PipSchema ? mongoose.model('pip', PipSchema) : null
