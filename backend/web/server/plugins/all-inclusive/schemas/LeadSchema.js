const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const siret = require("siret");
const { isEmailOk, isPhoneOk } = require("../../../../utils/sms");
const { DEPARTEMENTS, COMPANY_SIZE, COMPANY_ACTIVITY, SOURCE, LEAD_SOURCE } = require("../consts");

const Schema = mongoose.Schema;

const LeadSchema = new Schema({
  fullname: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  email: {
    type: String,
    set: v => v?.toLowerCase().trim(),
    validate: [value => isEmailOk(value), `L'email est invalide`],
    required: [true, `L'email est obligatoire`],
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
  company_name: {
    type: String,
    required: false,
  },
  company_siret: {
    type: String,
    set: v => v ? v.replace(/ /g, '') : v,
    validate: [v => !v || (siret.isSIRET(v) || siret.isSIREN(v)), 'Le siret/siren est invalide'],
    required: false,
  },
  company_size: {
    type: String,
    enum: Object.keys(COMPANY_SIZE),
    set: v => v || undefined,
    required: false,
  },
  company_zip_code: {
    type: String,
    enum: Object.keys(DEPARTEMENTS),
    set: v => v || undefined,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  position: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    set: v => v?.replace(/^0/, '+33') || undefined,
    validate: [value => isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
    required: false,
  },
  company_activity: {
    type: String,
    enum: Object.keys(COMPANY_ACTIVITY),
    set: v => v || undefined,
    required: false,
  },
  documents: [{
    type: Schema.Types.ObjectId,
    ref: 'document',
  }],
  callback: {
    type: Date,
    required: false,
  },
  source: {
    type: String,
    enum: Object.keys(LEAD_SOURCE),
    set: v => v || undefined,
    required: false,
  },
}, schemaOptions
);

LeadSchema.virtual("opportunities", {
  ref: "opportunity", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: 'leads' // is equal to foreignField
});

// All jobs
LeadSchema.virtual("notes", {
  ref: "note", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "lead" // is equal to foreignField
});

module.exports = LeadSchema
