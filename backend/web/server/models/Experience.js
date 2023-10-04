const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let ExperienceSchema=null

try {
  ExperienceSchema=require(`../plugins/${getDataModel()}/schemas/ExperienceSchema`)
  customizeSchema(ExperienceSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ExperienceSchema ? mongoose.model('experience', ExperienceSchema) : null
