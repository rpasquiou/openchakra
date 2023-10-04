const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let ChartPointSchema=null

try {
  ChartPointSchema=require(`../plugins/${getDataModel()}/schemas/ChartPointSchema`)
  customizeSchema(ChartPointSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ChartPointSchema ? mongoose.model('chartPoint', ChartPointSchema) : null
