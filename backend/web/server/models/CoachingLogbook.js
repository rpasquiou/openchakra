const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let CoachingLogbookSchema=null

try {
  CoachingLogbookSchema=require(`../plugins/${getDataModel()}/schemas/CoachingLogbookSchema`)
  customizeSchema(CoachingLogbookSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CoachingLogbookSchema ? mongoose.model('coachingLogbook', CoachingLogbookSchema) : null
