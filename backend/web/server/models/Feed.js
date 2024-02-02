const mongoose = require('mongoose')
const {getDataModel}=require('../../config/config')

let FeedSchema=null

try {
  FeedSchema=require(`../plugins/${getDataModel()}/schemas/FeedSchema`)
  FeedSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = FeedSchema ? mongoose.model('feed', FeedSchema) : null
