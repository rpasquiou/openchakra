const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ENOUGH_SCORES } = require('../consts')


const Schema = mongoose.Schema

const StatisticSchema = new Schema({
  enoughScores: {
    type: String,
    enum: Object.keys(ENOUGH_SCORES)
  },
  score_number: {
    type: Number
  },
  securityIncidentManagement: {
    type: Number
  },
  partner: {
    type: Number
  },
  inventory: {
    type: Number
  },
  insurance: {
    type: Number
  },
  cyberRef: {
    type: Number
  },
  intrusion: {
    type: Number
  },
  externalized: {
    type: Number
  },
  webApp: {
    type: Number
  },
  antivirus: {
    type: Number
  },
  charter: {
    type: Number
  },
  financial: {
    type: Number
  },
  sensibilization: {
    type: Number
  },
  mfa: {
    type: Number
  },
  admin: {
    type: Number
  },
}, schemaOptions  )

module.exports = StatisticSchema