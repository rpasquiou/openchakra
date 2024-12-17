const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const OrderTicketSchema = new Schema({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'order',
    required: [true, `La commande du ticket est obligatoire`]
  },
  firstname: {
    type: String,
    set: v => v?.trim(),
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = OrderTicketSchema