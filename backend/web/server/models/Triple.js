const mongoose = require('mongoose')

let TripleSchema=null

try {
  TripleSchema=require(`../plugins/${getDataModel()}/schemas/TripleSchema`)
  TripleSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}
module.exports = TripleSchema ? mongoose.model('triple', TripleSchema) : null