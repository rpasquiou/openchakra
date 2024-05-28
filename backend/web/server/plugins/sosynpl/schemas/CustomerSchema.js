const mongoose = require('mongoose')
const {isPhoneOk, isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const IBANValidator = require('iban-validator-js')
const { DISCRIMINATOR_KEY, ROLES, ROLE_CUSTOMER, COMPANY_SIZE, LEGAL_STATUS, SUSPEND_REASON, DEACTIVATION_REASON, ACTIVITY_STATE, ACTIVITY_STATE_ACTIVE, ACTIVITY_STATE_STANDBY, ACTIVITY_STATE_SUSPENDED, ROLE_FREELANCE } = require('../consts')
const siret = require('siret')
const AddressSchema = require('../../../models/AddressSchema')
const { DUMMY_REF } = require('../../../utils/database')
const { NATIONALITIES } = require('../../../../utils/consts')

const Schema = mongoose.Schema

const CustomerSchema = new Schema({
  position: {
    type: String,
    required: [true, `La fonction/métier principal est obligatoire`],
  },
  phone: {
    type: String,
    validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone est invalide'],
    set: v => v?.replace(/^0/, '+33'),
    required: [true, `Le téléphone est obligatoire`]
  },
  cgu_accepted: {
    type: Boolean,
    validate: [v => !!v, 'Vous devez accepter les CGU'],
    required: [true, 'Vous devez accepter les CGU'],
  },
  birthdate: {
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
    required: [true, `La raison sociale est obligatoire`]
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
    set: v => v || undefined,
    required: [function() {return this.role==ROLE_FREELANCE}, `Le statut légal est obligatoire`]
  },
  // Start legal representant
  legal_representant_self: {
    type: Boolean,
    default: false,
    required: true,
  },
  legal_representant_firstname: {
    type: String,
    get: function(v) {
      if (!!this.legal_representant_self) {
        return this.firstname
      }
      return v
    },
    required: false,
  },
  legal_representant_lastname: {
    type: String,
    get: function(v) {
      if (!!this.legal_representant_self) {
        return this.lastname
      }
      return v
    },
    required: false,
  },
  legal_representant_birthdate: {
    type: Date,
    get: function(v) {
      if (!!this.legal_representant_self) {
        return this.birthdate
      }
      return v
    },
    required: false,
  },
  legal_representant_phone: {
    type: String,
    get: function(v) {
      if (!!this.legal_representant_self) {
        return this.phone
      }
      return v
    },
    validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone est invalide'],
    set: v => v?.replace(/^0/, '+33'),
    required: false,
  },
  legal_representant_nationality: {
    type: String,
    enum: Object.keys(NATIONALITIES),
    get: function(v) {
      if (!!this.legal_representant_self) {
        return this.nationality
      }
      return v
    },
    required: false,
  },
  legal_representant_address: {
    type: AddressSchema,
    get: function(v) {
      if (!!this.legal_representant_self) {
        return this.address
      }
      return v
    },
    required: false,
  },
  legal_representant_email: {
    type: String,
    get: function(v) {
      if (!!this.legal_representant_self) {
        return this.email
      }
      return v
    },
    set: v => v ? v.toLowerCase().trim() : v,
    validate: [isEmailOk, v => `L'email du représentant légal '${v.value}' est invalide`],
    required: false,
  },
  // End legal representant
  // Billing contact
  billing_contact_self: {
    type: Boolean,
    default: false,
    required: true,
  },
  billing_contact_firstname: {
    type: String,
    get: function(v) {
      if (!!this.billing_contact_self) {
        return this.firstname
      }
      return v
    },
    required: false,
  },
  billing_contact_lastname: {
    type: String,
    get: function(v) {
      if (!!this.billing_contact_self) {
        return this.lastname
      }
      return v
    },
    required: false,
  },
  billing_contact_email: {
    type: String,
    get: function(v) {
      if (!!this.billing_contact_self) {
        return this.email
      }
      return v
    },
    set: v => v ? v.toLowerCase().trim() : v,
    validate: [isEmailOk, v => `L'email du contact de facturation '${v.value}' est invalide`],
  },
  billing_contact_address: {
    type: AddressSchema,
    get: function(v) {
      if (!!this.billing_contact_self) {
        return this.address
      }
      return v
    },
    required: false,
  },
  // End billing contact
  siren: {
    type: String,
    set: v => v ? v.replace(/ /g, '') : v,
    validate: [v => siret.isSIREN(v) , v => `Le siren '${v.value}' est invalide`],
    required: [true, `Le SIREN est obligatoire`]
  },
  // RCS city
  registration_city: {
    type: String,
    set: v => v?.city || v || undefined,
    required: false,
  },
  // HQ address
  headquarter_address: {
    type: AddressSchema,
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
  // Default: customer not suspended, freelance standby
  activity_status: {
    type: String,
    enum: Object.keys(ACTIVITY_STATE),
    default: function() {return this.role==ROLE_CUSTOMER ? ACTIVITY_STATE_ACTIVE: ACTIVITY_STATE_STANDBY},
    required: true,
  },
  // If account deactived
  deactivation_reason: {
    type: String,
    enum: Object.keys(DEACTIVATION_REASON),
    required: false,
  },
  suspended_reason: {
    type: String,
    enum: Object.keys(SUSPEND_REASON),
    set: v => v || undefined,
    required: false,
  },
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */

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

CustomerSchema.virtual('announces', {
  ref: 'annonuce',
  localField: '_id',
  foreignField: 'user',
})

/* eslint-enable prefer-arrow-callback */

module.exports = CustomerSchema
