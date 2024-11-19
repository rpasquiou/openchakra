const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { CURRENT_ADVERTISING_YES, CURRENT_ADVERTISING_NO } = require('../consts')

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
    required: [true, `Il est obligatoire de préciser si la publicité doit être active ou non`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
AdvertisingSchema.virtual('current_advertising', DUMMY_REF).get(function () {
  return this.is_current ? CURRENT_ADVERTISING_YES : CURRENT_ADVERTISING_NO
})
/* eslint-enable prefer-arrow-callback */

module.exports = AdvertisingSchema