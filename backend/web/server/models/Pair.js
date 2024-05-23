const mongoose = require('mongoose')

let PairSchema=null

try {
  PairSchema=require(`./PairSchema`)
  PairSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PairSchema ? mongoose.model('pair', PairSchema) : null
