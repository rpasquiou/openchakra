const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let BiographySchema=null

try {
  BiographySchema=require(`../plugins/${getDataModel()}/schemas/BiographySchema`)
  BiographySchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = BiographySchema ? mongoose.model('biography', BiographySchema) : null