const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ObjectiveSchema=null

try {
  ObjectiveSchema=require(`../plugins/${getDataModel()}/schemas/ObjectiveSchema`)
  customizeSchema(ObjectiveSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ObjectiveSchema ? mongoose.model('objective', ObjectiveSchema) : null
