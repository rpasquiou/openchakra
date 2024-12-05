const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ACCOMODATION_TYPES } = require('../consts')

const Schema = mongoose.Schema

const AccomodationSchema = new Schema({
  type: {
    type: String,
    enum: Object.keys(ACCOMODATION_TYPES),
    required: [true, `Le type d'équipement est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = AccomodationSchema