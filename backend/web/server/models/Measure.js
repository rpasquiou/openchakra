const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let MeasureSchema=null

try {
  MeasureSchema=require(`../plugins/${getDataModel()}/schemas/MeasureSchema`)
  customizeSchema(MeasureSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = MeasureSchema ? mongoose.model('measure', MeasureSchema) : null
