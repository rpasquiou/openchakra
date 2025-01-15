const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { USERTICKET_STATUSES, IS_SPEAKER_NO, IS_SPEAKER } = require('../consts')

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
  status: {
    type: String,
    enum: Object.keys(USERTICKET_STATUSES)
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'acheteur du ticket est obligatoire`]
  },
  meal: {
    type: Boolean,
    required: true,
    default: false,
  },
  is_speaker: {
    type: String,
    enum: Object.keys(IS_SPEAKER),
    required: true,
    default: IS_SPEAKER_NO
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = UserTicketSchema