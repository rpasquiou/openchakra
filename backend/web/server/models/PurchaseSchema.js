const mongoose = require('mongoose')
const { schemaOptions } = require('../utils/schemas')
const { PURCHASE_STATUS, PURCHASE_STATUS_NEW } = require('../../utils/consts')

const Schema = mongoose.Schema

const PurchaseSchema = new Schema({
  // Customer
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [function() { return this.status!=PURCHASE_STATUS_NEW}, `The customer is required`],
  },
  // Payment plugin payment id 
  external_id: {
    type: String,
    required: [function() { return this.status!=PURCHASE_STATUS_NEW}, `The API payment id is required`],
  },
  // Product
  pack: {
    type: Schema.Types.ObjectId,
    ref: 'pack',
    required: [true, `the product is required`],
  },
  status: {
    type: String,
    enum: Object.keys(PURCHASE_STATUS),
    default: PURCHASE_STATUS_NEW,
    required: [true, `The payment status is required`]
  },
}, schemaOptions)

module.exports = PurchaseSchema
