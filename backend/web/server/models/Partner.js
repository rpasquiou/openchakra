const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const User = require('./User')
const { DISC_PARTNER } = require('../plugins/cyberleague/consts')

let Partner=null

try {
  const partnerSchema=require(`../plugins/${getDataModel()}/schemas/PartnerSchema`)
  Partner=User.discriminator(DISC_PARTNER, partnerSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Partner
