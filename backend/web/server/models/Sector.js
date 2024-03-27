const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let SectorSchema=null

try {
  SectorSchema=require(`../plugins/${getDataModel()}/schemas/SectorSchema`)
  SectorSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = SectorSchema ? mongoose.model('sector', SectorSchema) : null
