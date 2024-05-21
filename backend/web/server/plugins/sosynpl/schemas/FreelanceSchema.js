const mongoose = require('mongoose')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const customerSchema=require('./CustomerSchema')
const AddressSchema = require('../../../models/AddressSchema')
const {COMPANY_SIZE, WORK_MODE, WORK_DURATION, SOURCE, SOSYNPL, DISCRIMINATOR_KEY, VALID_STATUS_PENDING, EXPERIENCE, ROLE_FREELANCE, ROLES, MOBILITY, MOBILITY_REGIONS, MOBILITY_CITY, MOBILITY_FRANCE} = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const { REGIONS } = require('../../../../utils/consts')

const MIN_SECTORS=1
const MAX_SECTORS=5

const MIN_DURATIONS=1
const MAX_DURATIONS=3

const MIN_JOB_SKILLS=0
const MAX_JOB_SKILLS=20

const MIN_EXTRA_SKILLS=0
const MAX_EXTRA_SKILLS=20

const MIN_REGIONS=1
const MAX_REGIONS=3

const Schema = mongoose.Schema

const FreelanceSchema = new Schema({
  ...customerSchema.obj,
  // Ovveride address => mandatory
  address: {
    type: AddressSchema,
    required: [true, `L'adresse est obligatoire`],
  },
  // Override role
  role: {
    type: String,
    enum: Object.keys(ROLES),
    default: ROLE_FREELANCE,
    required: [true, `Le rôle est obligatoire`],
    index: true,
  },
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
  second_job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: false,
  },
  second_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    set: v => v || undefined,
    required: [function() {return !!this.second_job}, `L'expérience du deuxième métier est obligatoire`],
  },
  third_job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: false,
  },
  third_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    set: v => v || undefined,
    required: [function() {return !!this.third_job}, `L'expérience du troisième métier est obligatoire`],
  },
  rate: {
    type: Number,
    validate: [v => !v || (parseInt(v)==v && v>1), `Le TJM doit être un nombre entier supérieur à 1€`],
    min: 1.0,
    required: false,
  },
  motivation: {
    type: String,
    required: [true, `Saisisez les types de missions recherchées`],
  },
  work_mode: {
    type: String,
    enum: Object.keys(WORK_MODE),
  },
  // 1 minimum, 3 max
  work_duration: {
    type: [{
      type: String,
      enum: Object.keys(WORK_DURATION),
    }],
    validate: [
      durations => lodash.inRange(durations?.length, MIN_DURATIONS, MAX_DURATIONS+1), 
      `Vous devez choisir de ${MIN_DURATIONS} à ${MAX_DURATIONS} durées de mission` 
    ]
  },
  // 1 minimum, 5 max
  work_sector: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'sector',
    }],
    validate: [
      sectors => lodash.inRange(sectors?.length, MIN_SECTORS, MAX_SECTORS+1), 
      `Vous devez choisir de ${MIN_SECTORS} à ${MAX_SECTORS} secteurs d'activité` 
    ]
  },
  work_company_size: {
    type: [{
      type: String,
      enum: Object.keys(COMPANY_SIZE),
    }],
  },
  hard_skills_job: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'hardSkill',
    }],
    default: [],
    validate: [
      skills => lodash.inRange(skills?.length||0, MIN_JOB_SKILLS, MAX_JOB_SKILLS+1), 
      `Vous devez choisir de ${MIN_JOB_SKILLS} à ${MAX_JOB_SKILLS} compétences métiers` 
    ]
  },
  hard_skills_extra: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'hardSkill',
    }],
    default: [],
    validate: [
      skills => lodash.inRange(skills?.length||0, MIN_EXTRA_SKILLS, MAX_EXTRA_SKILLS+1), 
      `Vous devez choisir de ${MIN_EXTRA_SKILLS} à ${MAX_EXTRA_SKILLS} compétences hors métier` 
    ]
  },
  experience: {
    type: String,
    required: [true, `L'expérience est obligatoire`],
  },
  validation_status: {
    type: String,
    default: VALID_STATUS_PENDING,
    required: [true, `Le statut de validation est obligatoire`],
  },
  professional_rc: {
    type: String,
    required: false,
  },
  linkedin: {
    type: String,
    required: [function() { return !this.curriculum}, `Un lien Linkedin ou un CV est obligatoire`]
  },
  curriculum: {
    type: String,
    required: [function() { return !this.linkedin}, `Un lien Linkedin ou un CV est obligatoire`]
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
  },
  hard_skills_categories: [{
    type: Schema.Types.ObjectId,
    ref: 'hardSkillCategory',
  }],
  available_hard_skills_categories: [{
    type: Schema.Types.ObjectId,
    ref: 'hardSkillCategory',
  }],
  expertises: [{
    type: Schema.Types.ObjectId,
    ref: 'expertise',
  }],
  mobility: {
    type: String,
    enum: Object.keys(MOBILITY),
    required: false,
  },
  mobility_regions: {
    type: [{
      type: String,
      enum: Object.keys(REGIONS)
    }],
    validate: [
      regions => lodash.inRange(regions?.length||0, MIN_REGIONS, MAX_REGIONS+1), 
      `Vous devez choisir de ${MIN_EXTRA_SKILLS} à ${MAX_EXTRA_SKILLS} régions` 
    ],
    required: [function() {return this.mobility==MOBILITY_REGIONS, `Vous devez choisir de ${MIN_EXTRA_SKILLS} à ${MAX_EXTRA_SKILLS} régions` }]
  },
  mobility_city: {
    type: AddressSchema,
    required: [function() {return this.mobility==MOBILITY_CITY}, `Vous devez choisir une ville`]
  },
  mobility_city_distance: {
    type: Number,
    required: [function() {return this.mobility==MOBILITY_CITY}, `Vous devez choisir une distance autour de la ville`]
  },
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
  foreignField: 'user',
})

FreelanceSchema.virtual('experiences', {
  ref: 'experience',
  localField: '_id',
  foreignField: 'user',
})

FreelanceSchema.virtual('certifications', {
  ref: 'experience',
  localField: '_id',
  foreignField: 'user',
})

FreelanceSchema.virtual('trainings', {
  ref: 'training',
  localField: '_id',
  foreignField: 'user',
})

// Depends on filled attributes
FreelanceSchema.virtual('search_visible').get(function() {
  return false
})

FreelanceSchema.virtual('languages', {
  ref: 'languageLevel',
  localField: '_id',
  foreignField: 'user',
})

FreelanceSchema.virtual('mobility_str', DUMMY_REF).get(function() {
  switch(this.mobility) {
    case MOBILITY_FRANCE: return MOBILITY[MOBILITY_FRANCE]
    case MOBILITY_REGIONS: return this.mobility_regions.map(i => REGIONS[i]).join(',')
    case MOBILITY_CITY: return `${this.mobility_city.city} dans un rayon de ${this.mobility_city_distance} km`
  }
})

FreelanceSchema.virtual('softwares', {
  ref: 'item',
  localField: '_id',
  foreignField: 'user',
})

/* eslint-enable prefer-arrow-callback */

module.exports = FreelanceSchema
