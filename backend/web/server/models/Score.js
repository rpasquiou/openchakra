const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ScoreSchema=null

try {
  ScoreSchema=require(`../plugins/${getDataModel()}/schemas/ScoreSchema`)
  ScoreSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ScoreSchema ? mongoose.model('album', ScoreSchema) : null