const mongoose = require('mongoose')
const moment = require('moment')
const { RESET_TOKEN_VALIDITY } = require('../consts')
const RandExp = require('randexp')
const Schema = mongoose.Schema

const ResetTokenSchema = new Schema({
  valid_until: {
    type: Date,
    default:  () => moment().add(RESET_TOKEN_VALIDITY, 'hours'),
  },
  token: {
    type: String,
    default: () => (new RandExp(new RegExp('[a-z0-9]{24}'))).gen(),
    required: [true, 'Le token est obligatoire']
  }
})

module.exports = ResetTokenSchema
