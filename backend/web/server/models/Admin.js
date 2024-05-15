const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const User = require('./User')
const { DISC_CUSTOMER, DISC_FREELANCE, DISC_ADMIN } = require('../plugins/sosynpl/consts')

let Admin=null

try {
  const adminSchema=require(`../plugins/${getDataModel()}/schemas/AdminSchema`)
  Admin=User.discriminator(DISC_ADMIN, adminSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Admin
