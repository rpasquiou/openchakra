const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ROLES, BOOLEAN_ENUM, EVENT_VISIBILITY, USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT, USERTICKET_STATUS_REGISTERED } = require('../consts')

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
  targeted_roles: {
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
  price_visibility: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: false
  },
  is_template: {
    type: Boolean,
    required: true,
    default: false
  },
  end_disponibility: {
    type: Date,
    required: false,
  },
  visibility: {
    type: String,
    enum: Object.keys(EVENT_VISIBILITY),
    required: false,
  },
  is_remaining_tickets_shown: {
    type: Boolean,
    required: false,
    default: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

EventTicketSchema.virtual('quantity_registered', {
  ref:'userTicket',
  localField:'_id',
  foreignField:'event_ticket',
  options: {
    match: {status: {$in: [USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT,USERTICKET_STATUS_REGISTERED]}},
  },
  count: true,
})

/* eslint-enable prefer-arrow-callback */

module.exports = EventTicketSchema