const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let TableSchema=null

try {
  TableSchema=require(`../plugins/${getDataModel()}/schemas/TableSchema`)
  TableSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TableSchema ? mongoose.model('table', TableSchema) : null