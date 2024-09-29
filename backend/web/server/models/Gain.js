const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let GainSchema=null

try {
  GainSchema=require(`../plugins/${getDataModel()}/schemas/GainSchema`)
  GainSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = GainSchema ? mongoose.model('gain', GainSchema) : null