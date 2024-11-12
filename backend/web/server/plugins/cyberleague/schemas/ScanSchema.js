const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { NUTRISCORE, SCAN_STATUSES } = require('../consts')

const Schema = mongoose.Schema

const ScanSchema = new Schema({
  status: {
    type: String,
    enum: Object.keys(SCAN_STATUSES),
    required: true
  },
  url: {
    type: String,
    required: true
  },
  protocole_rate: {
    type: Number,
    required: false
  },
  key_exchange_rate: {
    type: Number,
    required: false
  },
  cipher_strength_rate: {
    type: Number,
    required: false
  },
  nutriscore: {
    type: String,
    enum: Object.keys(NUTRISCORE),
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ScanSchema