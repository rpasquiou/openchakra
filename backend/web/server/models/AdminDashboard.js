const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let AdminDashboardSchema=null

try {
  AdminDashboardSchema=require(`../plugins/${getDataModel()}/schemas/AdminDashboardSchema`)
  customizeSchema(AdminDashboardSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = AdminDashboardSchema ? mongoose.model('adminDashboard', AdminDashboardSchema) : null
