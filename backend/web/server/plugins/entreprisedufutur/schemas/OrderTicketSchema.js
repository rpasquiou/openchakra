const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { isEmailOk } = require('../../../../utils/sms')

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
  lastname: {
    type: String,
    set: v => v?.trim(),
    required: false,
  },
  email: {
    type: String,
    required: false,
    set: v => v ? v.toLowerCase().trim() : v,
    validate: [isEmailOk, v => `L'email '${v.value}' est invalide`],
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = OrderTicketSchema