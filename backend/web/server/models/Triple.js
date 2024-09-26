const mongoose = require('mongoose')

let Schema=null

try {
  Schema=require(`./TripleSchema`)
  Schema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}
module.exports = Schema ? mongoose.model('triple', Schema) : null