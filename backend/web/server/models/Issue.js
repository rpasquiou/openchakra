const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let IssueSchema=null

try {
  IssueSchema=require(`../plugins/${getDataModel()}/schemas/IssueSchema`)
  customizeSchema(IssueSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = IssueSchema ? mongoose.model('issue', IssueSchema) : null
