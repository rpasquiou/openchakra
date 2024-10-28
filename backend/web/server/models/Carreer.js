const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let CarreerSchema=null

try {
  CarreerSchema=require(`../plugins/${getDataModel()}/schemas/CarreerSchema`)
  CarreerSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CarreerSchema ? mongoose.model('carreer', CarreerSchema) : null