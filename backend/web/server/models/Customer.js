const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const User = require('./User')
const { DISC_CUSTOMER } = require('../plugins/sosynpl/consts')

let Customer=null

try {
  const customerSchema=require(`../plugins/${getDataModel()}/schemas/CustomerSchema`)
  Customer=User.discriminator(DISC_CUSTOMER, customerSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Customer
