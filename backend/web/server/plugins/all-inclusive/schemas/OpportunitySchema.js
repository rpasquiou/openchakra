const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DEPARTEMENTS, LOCATION, BOOLEAN, EMERGENCY, LEAD_SOURCE, OPP_STATUS, OPP_STATUS_NEW } = require("../consts");

const Schema = mongoose.Schema;

const OpportunitySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  address: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur est obligatoire`],
  },
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`]
  },
  zip_code: {
    type: String,
    enum: Object.keys(DEPARTEMENTS),
    required: [true, `Le département est obligatoire`],
  },
  duration: {
    type: String,
    required: false,
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'document',
  }],
  leads: [{
    type: Schema.Types.ObjectId,
    ref: 'lead',
  }],
  job_users:  [{
    type: Schema.Types.ObjectId,
    ref: 'document',
  }],
  location: {
    type: String,
    enum: Object.keys(LOCATION),
    set: v => v || undefined,
    required: false,
  },
  recurrent: {
    type: String,
    enum: Object.keys(BOOLEAN),
    required: [true, 'La récurrence (oui/non) est obligatoire']
  },
  searched_job: {
    type: String,
    required: false,
  },
  emergency: {
    type: String,
    enum: Object.keys(EMERGENCY),
    required: false,
  },
  source: {
    type: String,
    enum: Object.keys(LEAD_SOURCE),
    required: false,
  },
  status: {
    type: String,
    enum: Object.keys(OPP_STATUS),
    default: OPP_STATUS_NEW,
    required: [true, `Le statut est obligatoire`],
  },
  }, schemaOptions
);

module.exports = OpportunitySchema
