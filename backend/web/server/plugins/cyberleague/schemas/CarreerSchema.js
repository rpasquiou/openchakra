const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { CONTRACT_TYPES, WORK_DURATIONS, PAY, STATUSES, STATUS_ACTIVE } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const CarreerSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'company',
      required: [true,`L'entreprise proposant l'emploi est obligatoire`]
    },
    position: {
      type: String,
      required: [true, `L'intitulé de poste est obligatoire`]
    },
    contract_type: {
      type: String,
      enum: Object.keys(CONTRACT_TYPES),
      required: [true, `Le type de contrat est obligatoire`]
    },
    candidates: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
      }],
      default: []
    },
    company_description: {
      type: String,
      validate: [value => value.length > 14, `La description de l'entreprise doit avoir plus de trois caractères`],
      required: true
    },
    post_description: {
      type: String,
      validate: [value => value.length > 14, `La description du poste doit avoir plus de trois caractères`],
      required: true
    },
    location: {
      type: AddressSchema,
      required: false
    },
    profil_description: {
      type: String,
      validate: [value => value.length > 14, `La description du profil doit avoir plus de trois caractères`],
      required: true
    },
    work_duration: {
      type: String,
      enum: Object.keys(WORK_DURATIONS),
      required: true
    },
    pay: {
      type: String,
      enum: Object.keys(PAY),
      required: false
    },
    status: {
      type: String,
      enum: Object.keys(STATUSES),
      dafault: STATUS_ACTIVE
    },
  },
  schemaOptions
)

/* eslint-disable prefer-arrow-callback */

CarreerSchema.virtual('candidates_count', DUMMY_REF).get(function() {
  return this. candidates?.length
})

/* eslint-enable prefer-arrow-callback */

module.exports = CarreerSchema