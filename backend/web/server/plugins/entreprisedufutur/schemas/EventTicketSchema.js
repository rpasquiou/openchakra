const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ROLES, BOOLEAN_ENUM, EVENT_VISIBILITY, USERTICKET_STATUS_PAYED, USERTICKET_STATUS_PENDING_PAYMENT, USERTICKET_STATUS_REGISTERED, BOOLEAN_ENUM_NO } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const EventTicketSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom du ticket est obligatoire`]
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: [function () {return !this.is_template}, `L'événement est obligatoire si le ticket n'est pas un template`]
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
    required: true,
    default: 10
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
    required: true,
    default: 1,
    validate: [v => v>0,`Le nombre maximum de billet par personne doit être d'au moins 1`]
  },
  price_visibility: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: false
  },
  is_template: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: true,
    default: BOOLEAN_ENUM_NO
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
  template: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: false,
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

EventTicketSchema.virtual('remaining_tickets', DUMMY_REF).get(function () {
  return this.quantity-(this.quantity_registered || 0)
})

/* eslint-enable prefer-arrow-callback */

module.exports = EventTicketSchema