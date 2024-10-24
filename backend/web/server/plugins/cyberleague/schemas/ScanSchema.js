const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { NUTRISCORE } = require('../consts')

const Schema = mongoose.Schema

const ScanSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur du score est obligatoire`]
  },
  protocole_rate: {
    type: Number,
    required: [true, `Le score de protocole est obligatoire`]
  },
  key_exchange_rate: {
    type: Number,
    required: [true, `Le score de clé de chiffrement est obligatoire`]
  },
  cipher_strength_rate: {
    type: Number,
    required: [true, `Le score de puissance de chiffrement est obligatoire`]
  },
  nutriscore: {
    type: String,
    enum: Object.keys(NUTRISCORE),
    required: [true,`Le nutriscore est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ScanSchema