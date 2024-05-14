const mongoose = require('mongoose')

let UserSchema=null

try {
  UserSchema=require(`./PairSchema`)
  UserSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = UserSchema ? mongoose.model('pair', UserSchema) : null
