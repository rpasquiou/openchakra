const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const OrderSchema = new Schema({
  event_ticket: {
    type: Schema.Types.ObjectId,
    ref: 'eventTicket',
    required: [true, `Le type de ticket est obligatoire`]
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = OrderSchema