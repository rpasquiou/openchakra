const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let PackSchema=null

try {
  PackSchema=require(`../plugins/${getDataModel()}/schemas/PackSchema`)
  PackSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PackSchema ? mongoose.model('pack', PackSchema) : null
