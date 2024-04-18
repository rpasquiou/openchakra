const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DEPARTEMENTS, LOCATION, BOOLEAN, EMERGENCY, LEAD_SOURCE, OPP_STATUS, OPP_STATUS_NEW } = require("../consts");
const { isEmailOk, isPhoneOk } = require("../../../../utils/sms");

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
  lead: {
    type: Schema.Types.ObjectId,
    ref: 'lead',
    validate: [function(value) {return !!value != !!this.user}, `On ne peut sélectionner à la fois un prospect et un client`],
    required: [function() {return !this.user}, `Un prospect ou un client est obligatoire`],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    validate: [function(value) {return !!value != !!this.lead}, `On ne peut sélectionner à la fois un prospect et un client`],
    required: [function() {return !this.lead}, `Un prospect ou un client est obligatoire`],
  },
  job_users:  [{
    type: Schema.Types.ObjectId,
    ref: 'jobUser',
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
    set: v => v ||  undefined,
    required: false,
  },
  source: {
    type: String,
    enum: Object.keys(LEAD_SOURCE),
    set: v => v || undefined,
    required: false,
  },
  status: {
    type: String,
    enum: Object.keys(OPP_STATUS),
    default: OPP_STATUS_NEW,
    required: [true, `Le statut est obligatoire`],
  },
  first_contact_fullname: {
    type: String,
    required: false,
  },
  first_contact_email: {
    type: String,
    set: v => v?.toLowerCase().trim(),
    validate: [value => isEmailOk(value), `L'email est invalide`],
    required: false,
  },
  first_contact_phone: {
    type: String,
    set: v => v?.replace(/^0/, '+33') || undefined,
    validate: [value => isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
    required: false,
  },
  second_contact_fullname: {
    type: String,
    required: false,
  },
  second_contact_email: {
    type: String,
    set: v => v?.toLowerCase().trim(),
    validate: [value => isEmailOk(value), `L'email est invalide`],
    required: false,
  },
  second_contact_phone: {
    type: String,
    set: v => v?.replace(/^0/, '+33') || undefined,
    validate: [value => isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
    required: false,
  },
  }, schemaOptions
);

module.exports = OpportunitySchema
