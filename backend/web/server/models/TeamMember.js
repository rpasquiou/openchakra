const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let TeamMemberSchema=null

try {
  TeamMemberSchema=require(`../plugins/${getDataModel()}/schemas/TeamMemberSchema`)
  customizeSchema(TeamMemberSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TeamMemberSchema ? mongoose.model('teamMember', TeamMemberSchema) : null
