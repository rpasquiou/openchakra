const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const lodash = require('lodash')
const { DUMMY_REF } = require('../../../utils/database')
const { SECTOR, COMPANY_SIZE } = require('../consts')
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
      enum: Object.keys(COMPANY_SIZE),
      required: false,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'partner',
      index: true,
      required: false,
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
      type: Schema.Types.ObjectId,
      ref: 'expertise',
      index: true,
      required: false
    },
    bullshit_text: {
      type: String,
      required: false,
    },
    certifications: [{
      type: Schema.Types.ObjectId,
      ref: 'certification',
      required: false,
    }],
    followed_by: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
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

CompanySchema.virtual('followers', {
  ref: 'user',
  localField: '_id',
  foreignField: 'companies_following'
})

CompanySchema.virtual('followers_count', {
  ref: 'user',
  localField: '_id',
  foreignField: 'companies_following',
  count: true,
})

module.exports = CompanySchema
