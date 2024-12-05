const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let AdvertisingSchema=null

try {
  AdvertisingSchema=require(`../plugins/${getDataModel()}/schemas/AdvertisingSchema`)
  AdvertisingSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AdvertisingSchema ? mongoose.model('advertising', AdvertisingSchema) : null