const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let GroupSchema=null

try {
  GroupSchema=require(`../plugins/${getDataModel()}/schemas/GroupSchema`)
  GroupSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = GroupSchema ? mongoose.model('group', GroupSchema) : null
