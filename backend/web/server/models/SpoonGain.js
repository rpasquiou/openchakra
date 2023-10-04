const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let SpoonGainSchema=null

try {
  SpoonGainSchema=require(`../plugins/${getDataModel()}/schemas/SpoonGainSchema`)
  customizeSchema(SpoonGainSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = SpoonGainSchema ? mongoose.model('spoonGain', SpoonGainSchema) : null
