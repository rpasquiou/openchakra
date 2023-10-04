const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let EventSchema=null

try {
  EventSchema=require(`../plugins/${getDataModel()}/schemas/EventSchema`)
  customizeSchema(EventSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = EventSchema ? mongoose.model('event', EventSchema) : null
