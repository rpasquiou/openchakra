const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let DidYouKnowSchema=null

try {
  DidYouKnowSchema=require(`../plugins/${getDataModel()}/schemas/DidYouKnowSchema`)
  DidYouKnowSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = DidYouKnowSchema ? mongoose.model('didYouKnow', DidYouKnowSchema) : null