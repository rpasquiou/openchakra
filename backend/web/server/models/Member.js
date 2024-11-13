const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const User = require('./User')
const { DISC_MEMBER } = require('../plugins/cyberleague/consts')

let Member=null

try {
  const memberSchema=require(`../plugins/${getDataModel()}/schemas/MemberSchema`)
  Member=User.discriminator(DISC_MEMBER, memberSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = Member
