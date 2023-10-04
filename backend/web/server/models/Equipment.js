const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let EquipmentSchema=null

try {
  EquipmentSchema=require(`../plugins/${getDataModel()}/schemas/EquipmentSchema`)
  customizeSchema(EquipmentSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = EquipmentSchema ? mongoose.model('equipment', EquipmentSchema) : null
