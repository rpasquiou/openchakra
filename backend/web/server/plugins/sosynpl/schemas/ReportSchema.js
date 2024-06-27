const mongoose = require("mongoose")
const moment = require("moment")
const { schemaOptions } = require('../../../utils/schemas');
const autoIncrement = require('mongoose-auto-increment')
const { DUMMY_REF } = require("../../../utils/database");

const Schema = mongoose.Schema;

const ReportSchema = new Schema({
  mission:  {
    type: Schema.Types.ObjectId,
    ref: 'mission',
  },

}, schemaOptions
);

/* eslint-disable prefer-arrow-callback */
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


module.exports = ReportSchema;
