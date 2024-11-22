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
  is_current: {
    type: Boolean,
    //computed
  },
  current_advertising: {
    type: String,
    // enum: Object.keys(CURRENT_ADVERTISING)
  },
  url: {
    type: String,
    required: [true, `L'url de redirection est obligatoire`]
  },
  name: {
    type: String,
    required: [true, `Le nom de la publicité est obligatooire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = AdvertisingSchema