const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DUMMY_REF } = require("../../../utils/database");

const Schema = mongoose.Schema;

const QuotationDetailSchema = new Schema({
  quotation: {
    type: Schema.Types.ObjectId,
    ref: 'quotation',
    required: [true, `Le devis parent est obligatoire`],
  },
  label: {
    type: String,
    required: [true, `L'intitulé est obligatoire`],
  },
  quantity: {
    type: Number,
    default: 1,
  },
  vat_rate: {
    type: Number,
    default: 0.2,
    min: [0, 'Le taux de TVA doit être compris entre 0 et 1'],
    max: [1, 'Le taux de TVA doit être compris entre 0 et 1'],
    required: [true, `Le taux de TVA est obligatoire`],
    get: function(value) { 
      return value * 100
    },
    set: function(value) { 
      return value / 100
    }
  },
  price: {
    type: Number,
    min: [0, `Le tarif doit être positif`],
    required: [true, `Le tarif est obligatoire`],
  }
}, schemaOptions
)

QuotationDetailSchema.virtual('ht_total', DUMMY_REF).get(function() {
  return this.price*this.quantity
})

QuotationDetailSchema.virtual('ttc_total', DUMMY_REF).get(function() {
  return this.ht_total * (1 + (this.get('vat_rate', null, { getters: false }) || 0))
})

QuotationDetailSchema.virtual('vat_total', DUMMY_REF).get(function() {
  return this.ht_total * (this.get('vat_rate', null, { getters: false }) || 0)
})


module.exports = QuotationDetailSchema;
