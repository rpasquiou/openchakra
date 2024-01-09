const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let BlockSchema=null

try {
  BlockSchema=require(`../plugins/${getDataModel()}/schemas/BlockSchema`)
  BlockSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}
module.exports = BlockSchema ? mongoose.model('block', BlockSchema) : null
