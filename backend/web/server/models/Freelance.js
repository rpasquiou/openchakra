const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const User = require('./User')
const { DISC_CUSTOMER, DISC_FREELANCE } = require('../plugins/sosynpl/consts')

let Freelance=null

try {
  const freelanceSchema=require(`../plugins/${getDataModel()}/schemas/FreelanceSchema`)
  Freelance=User.discriminator(DISC_FREELANCE, freelanceSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Freelance
