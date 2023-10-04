const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let RangeSchema=null

try {
  RangeSchema=require(`../plugins/${getDataModel()}/schemas/RangeSchema`)
  customizeSchema(RangeSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = RangeSchema ? mongoose.model('range', RangeSchema) : null
