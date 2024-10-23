const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let OpportunitySchema=null

try {
  OpportunitySchema=require(`../plugins/${getDataModel()}/schemas/OpportunitySchema`)
  OpportunitySchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = OpportunitySchema ? mongoose.model('opportunity', OpportunitySchema) : null
