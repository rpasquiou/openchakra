const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const lodash = require('lodash')
const { DUMMY_REF } = require('../../../utils/database')
const { SECTOR } = require('../consts')
const { isPhoneOk, isEmailOk } = require('../../../../utils/sms')

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
      type: Number,
      default: 0,
      required: [true, `La taille est obligatoire`],
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'partner',
      index: true,
      required: [true, `L'admin est obligatoire`],
    },
    sector: {
      type: String,
      enum: Object.keys(SECTOR),
      required: false,
    },
    email: {
      type: String,
      required: [true, `L'email est obligatoire`],
      set: v => v ? v.toLowerCase().trim() : v,
      index: true,
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
      type: Schema.Types.ObjectId,
      ref: 'expertise',
      index: true,
      required: false
    },
    baseline: {
      type: String,
      required: false,
    },
    certifications: [{
      type: Schema.Types.ObjectId,
      ref: 'certification',
      required: false,
    }]
  },
  schemaOptions,
)

CompanySchema.virtual('users', {
  ref: 'user', // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "company", // is equal to foreignField
});

module.exports = CompanySchema
