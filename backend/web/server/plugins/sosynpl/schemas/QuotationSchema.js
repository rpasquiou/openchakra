const mongoose = require('mongoose')
const lodash=require('lodash')
const moment=require('moment')
const {schemaOptions} = require('../../../utils/schemas')
const autoIncrement = require('mongoose-auto-increment')
const { DUMMY_REF } = require('../../../utils/database')
const { FREELANCE_COMMISSION_RATE, QUOTATION_STATUS, QUOTATION_STATUS_DRAFT, SOSYNPL_COMMISSION_VAT_RATE, CUSTOMER_COMMISSION_RATE } = require('../consts')

const Schema = mongoose.Schema

const QuotationSchema = new Schema({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'application',
    required: false,
  },
  report: {
    type: Schema.Types.ObjectId,
    ref: 'report',
    required: false,
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
  deliverable: {
    type: String,
    required: false,
  },
  detail: {
    type: String,
    required: false,
  },
  start_date: {
    type: Date,
    min: [() => moment(), `La mission ne peut débuter avant maintenant`],
    required: [true, `La date de début estimée est obligatoire`],
  },
  end_date: {
    type: Date,
    required: [true, `La date de fin estimée est obligatoire`],
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
  },
  billing_details: {
    type: String,
    required: false,
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

QuotationSchema.virtual('ht_freelance_commission', DUMMY_REF).get(function() {
  return this.ht_total*FREELANCE_COMMISSION_RATE
})

QuotationSchema.virtual('ttc_freelance_commission', DUMMY_REF).get(function() {
  return this.ht_freelance_commission*(1+SOSYNPL_COMMISSION_VAT_RATE)
})

QuotationSchema.virtual('vat_freelance_commission', DUMMY_REF).get(function() {
  return this.ht_freelance_commission*SOSYNPL_COMMISSION_VAT_RATE
})

QuotationSchema.virtual('ttc_net_revenue', DUMMY_REF).get(function() {
  return this.ttc_total*(1-FREELANCE_COMMISSION_RATE)
})

QuotationSchema.virtual('ht_net_revenue', DUMMY_REF).get(function() {
  return this.ht_total-this.ht_freelance_commission
})

QuotationSchema.virtual('ht_customer_commission', DUMMY_REF).get(function() {
  return this.ht_total*CUSTOMER_COMMISSION_RATE
})

QuotationSchema.virtual('ttc_customer_commission', DUMMY_REF).get(function() {
  return this.ttc_total*CUSTOMER_COMMISSION_RATE
})

QuotationSchema.virtual('vat_customer_commission', DUMMY_REF).get(function() {
  return this.ht_customer_commission*SOSYNPL_COMMISSION_VAT_RATE
})

QuotationSchema.virtual('ttc_customer_total', DUMMY_REF).get(function() {
  return this.ttc_total+this.ttc_customer_commission
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

QuotationSchema.pre('validate', function(next) {
  if (!this.application && !this.report) {
    return next(new Error(`Le devis doit être lié à une candidature ou une compte-rendu d'activité`))
  }
  // A report can have one quotation only
  if (!!this.report) {
    return mongoose.models['quotation'].exists({_id: {$ne: this._id}, report: this.report})
      .then(exists => {
        if (exists) {
          return next(new Error(`Il existe déjà un devis pour ce rapport d'activité`))
        }
      })
  }
  next()
})

module.exports = QuotationSchema
