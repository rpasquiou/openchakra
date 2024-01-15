const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let DurationSchema=null

try {
  DurationSchema=require(`../plugins/${getDataModel()}/schemas/DurationSchema`)
  DurationSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = DurationSchema ? mongoose.model('duration', DurationSchema) : null
