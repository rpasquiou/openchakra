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
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = OrderSchema