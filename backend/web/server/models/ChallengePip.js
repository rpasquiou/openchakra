const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let ChallengePipSchema=null

try {
  ChallengePipSchema=require(`../plugins/${getDataModel()}/schemas/ChallengePipSchema`)
  customizeSchema(ChallengePipSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ChallengePipSchema ? mongoose.model('challengePip', ChallengePipSchema) : null
