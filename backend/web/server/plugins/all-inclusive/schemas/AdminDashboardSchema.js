const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas')

const Schema = mongoose.Schema;

const AdminDashboardSchema = new Schema({
  contact_sent: {
    type: Number,
  },
  refused_bills: {
    type: Number,
  },
  accepted_bills: {
    type: Number,
  },
  visible_ti: {
    type: Number,
  },
  hidden_ti: {
    type: Number,
  },
  qualified_ti: {
    type: Number,
  },
  visible_tipi: {
    type: Number,
  },
  hidden_tipi: {
    type: Number,
  },
  qualified_tipi: {
    type: Number,
  },
  missions_requests: {
    type: Number,
  },
  refused_missions: {
    type: Number,
  },
  sent_quotations: {
    type: Number,
  },
  quotation_ca_total: {
    type: Number,
  },
  commission_ca_total: {
    type: Number,
  },
  tipi_commission_ca_total: {
    type: Number,
  },
  tini_commission_ca_total: {
    type: Number,
  },
  customer_commission_ca_total: {
    type: Number,
  },
  ti_registered_today: {
    type: Number,
  },
  customers_registered_today: {
    type: Number,
  },
}, schemaOptions
);


module.exports = AdminDashboardSchema
