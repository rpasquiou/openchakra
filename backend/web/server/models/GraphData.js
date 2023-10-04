const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let GraphDataSchema=null

try {
  GraphDataSchema=require(`../plugins/${getDataModel()}/schemas/GraphDataSchema`)
  customizeSchema(GraphDataSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = GraphDataSchema ? mongoose.model('graphData', GraphDataSchema) : null
