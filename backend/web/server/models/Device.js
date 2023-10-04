const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let DeviceSchema=null

try {
  DeviceSchema=require(`../plugins/${getDataModel()}/schemas/DeviceSchema`)
  customizeSchema(DeviceSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = DeviceSchema ? mongoose.model('device', DeviceSchema) : null
