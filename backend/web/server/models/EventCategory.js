const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let EventCategorySchema=null

try {
  EventCategorySchema=require(`../plugins/${getDataModel()}/schemas/EventCategorySchema`)
  EventCategorySchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = EventCategorySchema ? mongoose.model('eventCategory', EventCategorySchema) : null