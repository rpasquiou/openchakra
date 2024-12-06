const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let TablemapSchema=null

try {
  TablemapSchema=require(`../plugins/${getDataModel()}/schemas/TablemapSchema`)
  TablemapSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TablemapSchema ? mongoose.model('tablemap', TablemapSchema) : null