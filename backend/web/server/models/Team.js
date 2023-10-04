const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let TeamSchema=null

try {
  TeamSchema=require(`../plugins/${getDataModel()}/schemas/TeamSchema`)
  customizeSchema(TeamSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = TeamSchema ? mongoose.model('team', TeamSchema) : null
