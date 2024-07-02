const mongoose = require("mongoose")
const moment = require("moment")
const { schemaOptions } = require('../../../utils/schemas');
const autoIncrement = require('mongoose-auto-increment')
const { DUMMY_REF } = require("../../../utils/database");
const { REPORT_STATUS, REPORT_STATUS_DRAFT, REPORT_STATUS_DISPUTE, REPORT_STATUS_SENT, REPORT_STATUS_PAID, REPORT_STATUS_ACCEPTED } = require("../consts");

const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  mission:  {
    type: Schema.Types.ObjectId,
    ref: 'mission',
    required: [true, `La mission est obligatoire`],
  },
  status: {
    type: String,
    enum: Object.keys(REPORT_STATUS),
    default: REPORT_STATUS_DRAFT,
    required: [true, `Le statut du rapport d'activité est obligatoire`],
  },
  comment: {
    type: String,
    required: [true, `Le commentaire est obligatoire`]
  },
  sent_date: {
    type: Date,
    required: [function() {return this.status==REPORT_STATUS_SENT}, `La date d'envoi est obligatoire`]
  },
  accepted_date: {
    type: Date,
    required: [function() {return this.status==REPORT_STATUS_ACCEPTED}, `La date du refus est obligatoire`]
  },
  paid_date: {
    type: Date,
    required: [function() {return this.status==REPORT_STATUS_PAID}, `La date de paiement est obligatoire`]
  },
  refuse_date: {
    type: Date,
    required: [function() {return this.status==REPORT_STATUS_DISPUTE}, `La date du refus est obligatoire`]
  },
  refuse_reason: {
    type: String,
    required: [function() {return this.status==REPORT_STATUS_DISPUTE}, `La raison du refus est obligatoire`]
  },
}, schemaOptions
);

/* eslint-disable prefer-arrow-callback */

ReportSchema.virtual('quotation', {
  ref: 'quotation',
  localField: '_id',
  foreignField: 'report',
})

// Manage announce serial number
if (mongoose.connection) {
  autoIncrement.initialize(mongoose.connection) // Ensure autoincrement is initalized
}

ReportSchema.plugin(autoIncrement.plugin, { model: 'report', field: '_counter', startAt: 1});

ReportSchema.virtual('serial_number', DUMMY_REF).get(function() {
  if (!this._counter) {
    return undefined
  }
  return `C${moment().format('YY')}${this._counter.toString().padStart(5, 0)}`
})

/* eslint-enable prefer-arrow-callback */


ReportSchema.post('save',function(report){
  return mongoose.models['quotation'].exists({report})
    .then(exists => {
      if (!exists) {
        const dates=moment().add(1, 'month')
        return mongoose.models['quotation'].create({
          report, start_date: dates, end_date: dates, expiration_date: dates})
      }
    })
})

module.exports = ReportSchema;
