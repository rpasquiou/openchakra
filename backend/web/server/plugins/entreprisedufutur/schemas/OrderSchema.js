const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ORDER_STATUSES } = require('../consts')

const Schema = mongoose.Schema

const OrderSchema = new Schema({
  event_ticket: {
    type: Schema.Types.ObjectId,
    ref: 'eventTicket',
    required: [true, `Le type de ticket est obligatoire`]
  },
  status: {
    type: String,
    enum:Object.keys(ORDER_STATUSES),
    required: [true, `Le statut de la commande est obligatoire`]
  },
  unknown_tickets: {
    //computed
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'userTicket',
      required: true
    }],
    default: []
  },
  are_inputs_valid: {
    //computed
    type: Boolean,
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

OrderSchema.virtual('order_tickets', {
  ref: 'orderTicket',
  localField: '_id',
  foreignField: 'order'
})

OrderSchema.virtual('order_tickets_count', {
  ref: 'orderTicket',
  localField: '_id',
  foreignField: 'order',
  count: true
})

/* eslint-enable prefer-arrow-callback */

module.exports = OrderSchema