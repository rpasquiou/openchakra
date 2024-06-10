const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const User = require('./User')
const {DISC_CUSTOMER_FREELANCE } = require('../plugins/sosynpl/consts')

let Customer=null

try {
  const customerSchema=require(`../plugins/${getDataModel()}/schemas/CustomerFreelanceSchema`)
  Customer=User.discriminator(DISC_CUSTOMER_FREELANCE, customerSchema)
}
catch(err) {
  console.error(err)
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Customer
