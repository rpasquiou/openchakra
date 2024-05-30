const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let JobFeatureSchema=null

try {
  JobFeatureSchema=require(`../plugins/${getDataModel()}/schemas/JobFileFeatureSchema`)
  JobFeatureSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = JobFeatureSchema ? mongoose.model('jobFileFeature', JobFeatureSchema) : null
