const {getDataModel} = require('../../config/config')
const Event = require(`./Event`)
const {customizeSchema}=require('../../server/utils/database')

let CollectiveChallenge = null
try {
  if (Event) {
    const CollectiveChallengeSchema = require(`../plugins/${getDataModel()}/schemas/CollectiveChallengeSchema`)
    customizeSchema(CollectiveChallengeSchema)
    CollectiveChallenge = Event.discriminator('collectiveChallenge', CollectiveChallengeSchema)
  }
}
catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CollectiveChallenge
