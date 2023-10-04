const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let AssociationSchema=null

try {
  AssociationSchema=require(`../plugins/${getDataModel()}/schemas/AssociationSchema`)
  customizeSchema(AssociationSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AssociationSchema ? mongoose.model('association', AssociationSchema) : null
