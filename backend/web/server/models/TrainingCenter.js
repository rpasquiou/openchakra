const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let TrainingCenterSchema=null

try {
  TrainingCenterSchema=require(`../plugins/${getDataModel()}/schemas/TrainingCenterSchema`)
  customizeSchema(TrainingCenterSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TrainingCenterSchema ? mongoose.model('trainingCenter', TrainingCenterSchema) : null
