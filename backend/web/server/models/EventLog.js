const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let EventLogSchema=null

try {
  EventLogSchema=require(`../plugins/${getDataModel()}/schemas/EventLogSchema`)
  customizeSchema(EventLogSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = EventLogSchema ? mongoose.model('eventLog', EventLogSchema) : null
