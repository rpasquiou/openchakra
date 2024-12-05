const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let AccomodationSchema=null

try {
  AccomodationSchema=require(`../plugins/${getDataModel()}/schemas/AccomodationSchema`)
  AccomodationSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AccomodationSchema ? mongoose.model('accomodation', AccomodationSchema) : null