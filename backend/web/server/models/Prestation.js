const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let PrestationSchema=null

try {
  PrestationSchema=require(`../plugins/${getDataModel()}/schemas/PrestationSchema`)
  customizeSchema(PrestationSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PrestationSchema ? mongoose.model('prestation', PrestationSchema) : null
