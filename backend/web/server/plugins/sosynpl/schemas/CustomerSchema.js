const mongoose = require('mongoose')
const {isPhoneOk, isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const IBANValidator = require('iban-validator-js')
const { NATIONALITIES, DISCRIMINATOR_KEY, ROLES, ROLE_CUSTOMER, COMPANY_SIZE, LEGAL_STATUS, SUSPEND_REASON, DEACTIVATION_REASON, SUSPEND_STATE, SUSPEND_STATE_NOT_SUSPENDED, SUSPEND_STATE_STANDBY, SUSPEND_STATE_SUSPENDED } = require('../consts')
const siret = require('siret')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const CustomerSchema = new Schema({
  position: {
    type: String,
    required: [true, `La fonction est obligatoire`],
  },
  phone: {
    type: String,
    validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
    set: v => v?.replace(/^0/, '+33'),
    required: [true, `Le téléphone est obligatoire`]
  },
  cgu_accepted: {
    type: Boolean,
    required: [true, 'Vous devez accepter les CGU'],
  },
  birthday: {
    type: Date,
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  iban: {
    type: String,
    validate: [v => !v || IBANValidator.isValid(v), v => `L'IBAN '${v.value}' est invalide`],
    required: false,
  },
  sepa_mandate_document: {
    type: String,
    required: false,
  },
  kbis: { // Document
    type: String,
    required: false,
  },
  social_capital: {
    type: Number,
    required: false,
  },
  identity_proof_1: {
    type: String,
    required: false,
  },
  identity_proof_2: {
    type: String,
    required: false,
  },
  company_name: {
    type: String,
    required: [true, `Le nom de la société est obligatoire`]
  },
  company_size: {
    type: String,
    enum: Object.keys(COMPANY_SIZE),
    required: false,
  },
  company_logo: {
    type: String,
    required: false,
  },
  legal_status: {
    type: String,
    enum: Object.keys(LEGAL_STATUS),
    required: false,
  },
  legal_representant_fullname: {
    type: String,
    required: false,
  },
  legal_representant_email: {
    type: String,
    set: v => v ? v.toLowerCase().trim() : v,
    validate: [isEmailOk, v => `L'email du représentant légal '${v.value}' est invalide`],
    required: false,
  },
  billing_contact_fullname: {
    type: String,
    required: false,
  },
  billing_contact_email: {
    type: String,
    set: v => v ? v.toLowerCase().trim() : v,
    validate: [isEmailOk, v => `L'email du contact de facturation '${v.value}' est invalide`],
  },
  siren: {
    type: String,
    set: v => v ? v.replace(/ /g, '') : v,
    validate: [v => siret.isSIREN(v) , v => `Le siren '${v.value}' est invalide`],
    required: [true, `Le SIREN est obligatoire`]
  },
  // RCS city
  registration_city: {
    type: String,
    required: false,
  },
  // HQ city
  headquarter_city: {
    type: String,
    required: false,
  },
  // Délégation de pouvoir
  authority_delegated: {
    type: String,
    required: false,
  },
  authority_delegation: {
    type: String,
    required: [function() {return !!this.authority_delegated}, `Le document de délégation de pouvoir est obligatoire`],
  },
  nationality: {
    type: String,
    enum: Object.keys(NATIONALITIES),
    required: false,
  },
  vat_subject: { // Asujetti à la TVA
    type: Boolean,
    required: false,
  },
  vat_number: {
    type: String,
    required: [function() {return this.vat_subject===true}, `Le numéro de TVA est obligatoire`],
  },
  address: {
    type: AddressSchema,
    required: false,
  },
  sector: {
    type: Schema.Types.ObjectId,
    ref: 'sector',
    set: v => v || undefined,
    required: false,
  },
  // Active or "deleted" account
  active: {
    type: Boolean,
    default: false,
    requried: true,
  },
    // If account deactived
  deactivation_reason: {
    type: String,
    enum: Object.keys(DEACTIVATION_REASON),
    required: [function() {return !this.active}, `La raison de désactivation est obligatoire`],
  },
  // Default: customer not suspended, freelance standby
  suspended_status: {
    type: String,
    enum: Object.keys(SUSPEND_STATE),
    default: function() {return this.role==ROLE_CUSTOMER ? SUSPEND_STATE_NOT_SUSPENDED: SUSPEND_STATE_STANDBY},
    required: true,
  },
  suspended_reason: {
    type: String,
    enum: Object.keys(SUSPEND_REASON),
    set: v => v || undefined,
    required: [function() {return this.suspended_state==SUSPEND_STATE_SUSPENDED}, `La raison de suspension est obligatoire`],
  },
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */
// Required for register validation only
CustomerSchema.virtual('customer_missions', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'customer',
})

CustomerSchema.virtual('pinned_missions', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'pinned_by',
})

CustomerSchema.virtual('pinned_freelances', {
  ref: 'freelance',
  localField: '_id',
  foreignField: 'pinned_by',
})

/* eslint-enable prefer-arrow-callback */

module.exports = CustomerSchema
