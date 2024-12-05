const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ROLES } = require('../consts')

const Schema = mongoose.Schema

const EventTicketSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom du ticket est obligatoire`]
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: [true, `L'événement est obligatoire`]
  },
  _targeted_roles: {
    type: [{
      type: String,
      enum: Object.keys(ROLES),
      required: true,
    }],
    default: Object.keys(ROLES)
  },
  media: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: false
  },
  price: {
    type: Number,
    required: false
  },
  discounted_price: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  quantity_max_per_user: {
    type: Number,
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = EventTicketSchema