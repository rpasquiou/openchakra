const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let ChallengeUserPipSchema=null

try {
  ChallengeUserPipSchema=require(`../plugins/${getDataModel()}/schemas/ChallengeUserPipSchema`)
  customizeSchema(ChallengeUserPipSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = ChallengeUserPipSchema ? mongoose.model('challengeUserPip', ChallengeUserPipSchema) : null
