const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let LogbookDaySchema=null

try {
  LogbookDaySchema=require(`../plugins/${getDataModel()}/schemas/LogbookDaySchema`)
  customizeSchema(LogbookDaySchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = LogbookDaySchema ? mongoose.model('logbookDay', LogbookDaySchema) : null
