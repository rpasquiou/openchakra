const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const UserTicketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'acheteur du ticket est obligatoire`]
  },
  event_ticket: {
    type: Schema.Types.ObjectId,
    ref: 'eventTicket',
    required: [true, `Le type de ticket est obligatoire`]
  },
  url: {
    type: String,
    required: false
  },
  is_present: {
    type: Boolean,
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = UserTicketSchema