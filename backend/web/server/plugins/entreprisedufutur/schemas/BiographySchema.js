const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { BIOGRAPHY_STATUSES } = require('../consts')

const Schema = mongoose.Schema

const BiographySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `La cible de la biographie est obligatoire`]
  },
  date: {
    type: Date,
    required: false
  },
  text: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  media: {
    type: String,
    required: false
  },
  picture: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: Object.keys(BIOGRAPHY_STATUSES),
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = BiographySchema