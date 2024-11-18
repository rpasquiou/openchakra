const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const AdvertisingSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: [true, `L'entreprise créatrice de la publicité est obligatoire`]
  },
  small_banner: {
    type: String,
    required: [true, `Les images sont obligatoires`]
  },
  large_banner: {
    type: String,
    required: [true, `Les images sont obligatoires`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = AdvertisingSchema