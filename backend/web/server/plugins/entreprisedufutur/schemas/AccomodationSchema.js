const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ACCOMODATION_TYPES } = require('../consts')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const AccomodationSchema = new Schema({
  type: {
    type: String,
    enum: Object.keys(ACCOMODATION_TYPES),
    required: [true, `Le type d'équipement est obligatoire`]
  },
  name: {
    type: String,
    required: false
  },
  address: {
    type: AddressSchema,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = AccomodationSchema