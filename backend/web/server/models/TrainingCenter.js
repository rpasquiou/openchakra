const mongooseLeanVirtuals=require('mongoose-lean-virtuals')
const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let TrainingCenterSchema=null

try {
  TrainingCenterSchema=require(`../plugins/${getDataModel()}/schemas/TrainingCenterSchema`)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

TrainingCenterSchema?.plugin(mongooseLeanVirtuals)
module.exports = TrainingCenterSchema ? mongoose.model('trainingCenter', TrainingCenterSchema) : null
