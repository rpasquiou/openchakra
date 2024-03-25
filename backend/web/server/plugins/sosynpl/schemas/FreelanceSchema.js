const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const customerSchema=require('./CustomerSchema')
const {COMPANY_SIZE, WORK_MODE, WORK_DURATION, SOURCE, SOSYNPL, DISCRIMINATOR_KEY, VALID_STATUS_PENDING, EXPERIENCE} = require('../consts')

console.log(Object.keys(customerSchema))
const Schema = mongoose.Schema

const FreelanceSchema = new Schema({
  ...customerSchema.obj,
  main_job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: [true, `Le métier principal est obligatoire`],
  },
  main_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    required: [true, `L'expérience principale est obligatoire`],
  },
  second_job: [{
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: false,
  }],
  second_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    required: [function() {return !!this.second_job}, `L'expérience du deuxième métier est obligatoire`],
  },
  third_job: [{
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: false,
  }],
  third_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    required: [function() {return !!this.third_job}, `L'expérience du troisième métier est obligatoire`],
  },
  rate: {
    type: Number,
    validate: [v => !v || (parseInt(v)==v && v>1), `Le TJM doit être un nombre entier supérieur à 1€`],
    min: 1.0,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  motivation: {
    type: String,
    required: [true, `Saisisez une présentation à destination de ${SOSYNPL}`],
  },
  company_size: [{
    type: String,
    enum: Object.keys(COMPANY_SIZE)
  }],
  work_mode: {
    type: String,
    enum: Object.keys(WORK_MODE),
  },
  work_duration: [{
    type: String,
    required: [true, `La durée préférée est obligatoire`],
    enum: Object.keys(WORK_DURATION),
  }],
  sector: [{
    type: Schema.Types.ObjectId,
    ref: 'sector',
    required: false,
  }],
  softwares: [{
    type: Schema.Types.ObjectId,
    ref: 'software',
    required: false,
  }],
  languages: [{
    type: Schema.Types.ObjectId,
    ref: 'language',
    required: false,
  }],
  experience: {
    type: String,
    required: [true, `L'expérience est obligatoire`],
  },
  validation_status: {
    type: String,
    default: VALID_STATUS_PENDING,
    required: [true, `Le statut de validaiton est obligatoire`],
  },
  professional_rc: {
    type: String,
    required: false,
  },
  linkedin: {
    type: String,
    required: [function() { return !this.curriculum, `Un lien Linkedin ou un CV est obligatoire`}]
  },
  curriculum: {
    type: String,
    required: [function() { return !this.linkedin, `Un lien Linkedin ou un CV est obligatoire`}]
  },
  source: {
    type: String,
    enum: Object.keys(SOURCE),
    required: [true, `Sélectionnez la manière dont vous avez connu ${SOSYNPL}`]
  },
  picture_visible: {
    type: Boolean,
    default: false,
    required: [true, `La visibilité de la photo est obligatoire`]
  },
  google_visible: {
    type: Boolean,
    default: false,
    required: [true, `La visibilité Google est obligatoire`]
  }
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */

FreelanceSchema.virtual('freelance_missions', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'freelance',
})

FreelanceSchema.virtual('recommandations', {
  ref: 'recommandation',
  localField: '_id',
  foreignField: 'freelance',
})

FreelanceSchema.virtual('communications', {
  ref: 'communication',
  localField: '_id',
  foreignField: 'freelance',
})

// Depends on filled attributes
FreelanceSchema.virtual('search_visible').get(function() {
  return false
})

/* eslint-enable prefer-arrow-callback */

module.exports = FreelanceSchema
