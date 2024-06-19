const mongoose = require('mongoose')
const lodash=require('lodash')
const moment=require('moment')
const {schemaOptions} = require('../../../utils/schemas')
const autoIncrement = require('mongoose-auto-increment')
const { DUMMY_REF } = require('../../../utils/database')
const { FREELANCE_COMMISSION_RATE, QUOTATION_STATUS, QUOTATION_STATUS_DRAFT } = require('../consts')

const Schema = mongoose.Schema

const QuotationSchema = new Schema({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'application',
    required: [true, `L'annonce est obligatoire`],
  },
  expiration_date: {
    type: Date,
    validate: [dt=> moment(dt).isAfter(moment()), `La date d'expiration doit être postérieure à aujourd'hui`],
    required: [true, `La date d'expiration est obligatoire`]
  },
  comments: {
    type: String,
    required: false,
  },
  // Refence for freelance internal use
  reference: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: Object.keys(QUOTATION_STATUS),
    default: QUOTATION_STATUS_DRAFT,
    required: true,
  },
  _counter: {
    type: Number,
  }
}, schemaOptions,
)

QuotationSchema.virtual('details', {
  ref: 'quotationDetail', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'quotation', // is equal to foreignField
})

QuotationSchema.virtual('ht_total', DUMMY_REF).get(function() {
  return lodash(this.details).map(d => d.ht_total).sum()
})

QuotationSchema.virtual('ttc_total', DUMMY_REF).get(function() {
  return lodash(this.details).map(d => d.ttc_total).sum()
})

QuotationSchema.virtual('vat_total', DUMMY_REF).get(function() {
  return lodash(this.details).map(d => d.vat_total).sum()
})

QuotationSchema.virtual('net_revenue', DUMMY_REF).get(function() {
  return this.ttc_total*(1-FREELANCE_COMMISSION_RATE)
})

QuotationSchema.virtual('quantity_total', DUMMY_REF).get(function() {
  return lodash(this.details).map(d => d.quantity).sum()
})

QuotationSchema.virtual('average_daily_rate_ht', DUMMY_REF).get(function() {
  if (!this.ht_total || !this.quantity_total) {
    return undefined
  }
  return this.ht_total/this.quantity_total
})

QuotationSchema.virtual('average_daily_rate_ttc', DUMMY_REF).get(function() {
  if (!this.ttc_total || !this.quantity_total) {
    return undefined
  }
  return this.ttc_total/this.quantity_total
})

// Manage announce serial number
if (mongoose.connection) {
  autoIncrement.initialize(mongoose.connection) // Ensure autoincrement is initalized
}

QuotationSchema.plugin(autoIncrement.plugin, { model: 'quotation', field: '_counter', startAt: 1});

QuotationSchema.virtual('serial_number', DUMMY_REF).get(function() {
  if (!this._counter) {
    return undefined
  }
  return `D${moment().format('YY')}${this._counter.toString().padStart(5, 0)}`
})

module.exports = QuotationSchema
