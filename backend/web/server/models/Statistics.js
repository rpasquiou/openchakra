const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let StatisticsSchema=null

try {
  StatisticsSchema=require(`../plugins/${getDataModel()}/schemas/StatisticsSchema`)
  StatisticsSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = StatisticsSchema ? mongoose.model('statistics', StatisticsSchema) : null
