const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DUMMY_REF } = require("../../../utils/database");

const Schema = mongoose.Schema;

const QuotationDetailSchema = new Schema({
  quoation: {
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
    required: [true, 'La quantité est obligatoire'],
  },
  vat_rate: {
    type: Number,
    default: 0.2,
    min: [0, 'Le taux de TVA doit être compris entre 0% et 100%'],
    max: [100, 'Le taux de TVA doit être compris entre 0% et 100%'],
    required: [true, `Le taux de TVA est obligatoire`],
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
  return this.ht_total*(1+this.vat_rate)
})

QuotationDetailSchema.virtual('vat_total', DUMMY_REF).get(function() {
  return this.ht_total*this.vat_rate
})


module.exports = QuotationDetailSchema;
