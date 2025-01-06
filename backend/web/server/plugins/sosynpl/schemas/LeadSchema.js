const lodash=require('lodash')
const { isEmailOk } = require('../../../../utils/sms')
const { isPhoneOk } = require('../../../../utils/sms')
const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')

const Schema = mongoose.Schema

const LeadSchema = new Schema({
  firstname: {
    type: String,
    set: v => lodash.isString(v)  ? v.trim() : v,
    required: true,
  },
  lastname: {
    type: String,
    set: v => lodash.isString(v)  ? v.trim() : v,
    required: true,
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
    validate: [value => !value || isPhoneOk(value), 'Le numéro de téléphone est invalide'],
    set: v => v?.replace(/^0/, '+33'),
    required: false,
  },
  company_name : {
    type: String,
    required: false
  },
  motivation: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  treated: {
    type: Boolean,
    default: false,
    required: false
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-enable prefer-arrow-callback */

module.exports = LeadSchema
