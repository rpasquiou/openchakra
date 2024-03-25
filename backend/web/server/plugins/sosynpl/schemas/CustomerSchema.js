const mongoose = require('mongoose')
const {isPhoneOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const IBANValidator = require('iban-validator-js')
const { ROLE, NATIONALITIES, DISCRIMINATOR_KEY } = require('../consts')

const Schema = mongoose.Schema

const CustomerSchema = new Schema({
  position: {
    type: String,
    required: [true, `La fonction est obligatoire`],
  },
  roles: [{
    type: String,
    enum: Object.keys(ROLE),
    required: [true, `Le rôle est obligatoire`],
    index: true,
  }],
  phone: {
    type: String,
    validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
    set: v => v?.replace(/^0/, '+33'),
    required: false,
  },
  cguAccepted: {
    type: Boolean,
    required: [function() { return this?.role==ROLE_CUSTOMER }, 'Vous devez accepter les CGU'],
  },
  birthday: {
    type: Date,
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
  iban: {
    type: String,
    validate: [v => !v || IBANValidator.isValid(v), v => `L'IBAN '${v.value}' est invalide`],
    required: false,
  },
  kbis: { // Document
    type: String,
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
  siren: {
    type: String,
    set: v => v ? v.replace(/ /g, '') : v,
    validate: [v => !v || siret.isSIREN(v) , v => `Le siren '${v.value}' est invalide`],
    required: false,
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
    required: [function() {this.vat_subject===true, `Le numéro de TVA est obligatoire`}],
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
