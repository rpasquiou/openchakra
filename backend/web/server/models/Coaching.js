const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let CoachingSchema=null

try {
  CoachingSchema=require(`../plugins/${getDataModel()}/schemas/CoachingSchema`)
  customizeSchema(CoachingSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CoachingSchema ? mongoose.model('coaching', CoachingSchema) : null
