const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let GroupSchema=null

try {
  GroupSchema=require(`../plugins/${getDataModel()}/schemas/GroupSchema`)
  customizeSchema(GroupSchema)
}
catch(err) {
  GroupSchema=null
}

module.exports = GroupSchema ? mongoose.model('group', GroupSchema) : null
