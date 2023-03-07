const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let KeyScoreSchema=null

try {
  KeyScoreSchema=require(`../plugins/${getDataModel()}/schemas/KeySchema`)
  KeyScoreSchema.plugin(mongooseLeanVirtuals)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = KeyScoreSchema ? mongoose.model('keyscore', KeyScoreSchema) : null
