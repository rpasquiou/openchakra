const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let IndividualChallenge = null
try {
  const Event = require(`./Event`)
  if (Event) {
    const IndividualChallengeSchema = require(`../plugins/${getDataModel()}/schemas/IndividualChallengeSchema`)
    customizeSchema(IndividualChallengeSchema)
    IndividualChallenge = Event.discriminator('individualChallenge', IndividualChallengeSchema)
  }
}
catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = IndividualChallenge
