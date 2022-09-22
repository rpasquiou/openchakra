const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PriceListSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  reference: {
    type: String,
    set: v => v ? v.toUpperCase() : v,
    required: true,
  },
  // Catalog price
  price: {
    type: Number,
    min: 0,
    required: true,
  },
}, {toJSON: {virtuals: true, getters: true}})

module.exports = PriceListSchema
