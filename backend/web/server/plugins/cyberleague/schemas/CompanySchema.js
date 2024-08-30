const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const siret = require('siret')
const { DUMMY_REF } = require('../../../utils/database')
const { SECTOR, COMPANY_SIZE } = require('../consts')
const { isPhoneOk, isEmailOk } = require('../../../../utils/sms')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la société est requis'],
    },
    picture: {
      type: String,
    },
    size: {
      type: String,
      enum: Object.keys(COMPANY_SIZE),
      required: false,
    },
    administrators: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      }],
      required: false
    },
    sector: {
      type: String,
      enum: Object.keys(SECTOR),
      required: false,
    },
    email: {
      type: String,
      required: false,
      set: v => v ? v.toLowerCase().trim() : v,
      index: false,
      validate: [isEmailOk, v => `L'email '${v.value}' est invalide`],
    },
    phone: {
      type: String,
      validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone doit commencer par 0 ou +33'],
      set: v => v?.replace(/^0/, '+33'),
      required: false,
    },
    url: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    expertises: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'expertise',
        index: true,
        required: true
      }],
      default: []
    },
    certifications: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'certification',
        required: true,
      }],
      default: []
    },
    customer_successes: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'customerSuccess',
        required: true,
      }],
      default: [],
    },
    pinned_by: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      }],
      default: [],
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    city: {
      type: AddressSchema,
      required: false
    },
    is_partner: {
      type: Boolean,
      required: true
    },
    perimeter: {
      type: Number,
      required: false
    },
    baseline: {
      type: String,
      required: false
    },
    company_creation: {
      type: Date,
      required: false
    },
    siret: {
      type: String,
      set: v => v?.replace(/ /g, ''),
      validate: [v => siret.isSIRET(v)||siret.isSIREN(v), 'Le SIRET ou SIREN est invalide'],
      required: false,
    },
    targeted_markets: {
      type: [{
        type: String,
        enum: Object.keys(SECTOR),
        required: true,
      }],
      default: [],
    }
  },
  schemaOptions,
)

/* eslint-disable prefer-arrow-callback */

CompanySchema.virtual('users', {
  ref: 'user', // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "company", // is equal to foreignField
});

CompanySchema.virtual('company_contents', {
  ref: 'content', // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "companies", // is equal to foreignField
});

CompanySchema.virtual('missions', {
  ref: 'mission', // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "companies", // is equal to foreignField
});

CompanySchema.virtual('company_events', {
  ref: 'event', // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "company", // is equal to foreignField
});

CompanySchema.virtual('pinned_by_count', DUMMY_REF).get(function () {
  return this.pinned_by?.length || 0
})

/* eslint-enable prefer-arrow-callback */

module.exports = CompanySchema