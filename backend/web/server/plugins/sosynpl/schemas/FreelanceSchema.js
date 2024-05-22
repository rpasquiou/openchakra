const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const customerSchema=require('./CustomerSchema')
const AddressSchema = require('../../../models/AddressSchema')
const {COMPANY_SIZE, WORK_MODE, WORK_DURATION, SOURCE, SOSYNPL, DISCRIMINATOR_KEY, VALID_STATUS_PENDING, EXPERIENCE, ROLE_FREELANCE, ROLES, 
  MOBILITY, MOBILITY_REGIONS, MOBILITY_CITY, MOBILITY_FRANCE, AVAILABILITY, AVAILABILITY_UNDEFINED, AVAILABILITY_OFF, AVAILABILITY_ON, SS_THEMES} = require('../consts')
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

const MIN_DAYS_PER_WEEK=1
const MAX_DAYS_PER_WEEK=5

const MAX_GOLD_SOFT_SKILLS=1
const MAX_SILVER_SOFT_SKILLS=2
const MAX_BRONZE_SOFT_SKILLS=3

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
  // START MOBILITY
  mobility: {
    type: String,
    enum: Object.keys(MOBILITY),
    set : v => v || undefined,
    required: false,
  },
  mobility_regions: {
    type: [{
      type: String,
      enum: Object.keys(REGIONS)
    }],
    validate: [
      function(regions) {
        return this.mobility!=MOBILITY_REGIONS || lodash.inRange(regions?.length||0, MIN_REGIONS, MAX_REGIONS+1)
      },
      `Vous devez choisir de ${MIN_REGIONS} à ${MAX_REGIONS} régions` 
    ],
    required: [function() {return this.mobility==MOBILITY_REGIONS}, `Vous devez choisir de ${MIN_EXTRA_SKILLS} à ${MAX_EXTRA_SKILLS} régions`]
  },
  mobility_city: {
    type: AddressSchema,
    required: [function() {return this.mobility==MOBILITY_CITY}, `Vous devez choisir une ville`]
  },
  mobility_city_distance: {
    type: Number,
    required: [function() {return this.mobility==MOBILITY_CITY}, `Vous devez choisir une distance autour de la ville`]
  },
  // END MOBILITY
  // START AVAILBILITY
  /**
   * TODO: make available when not available and available_from is reached 
   * TODO: notification if not change after 8 days, make undefined after 9 days
   * TODO: notify if no change after 15 days
   * TODO: notify if no change after 30 days, set to available_off
   * TODO: notify mail 'are yo niterested' if no change after 60 days, set to undefined
  */
  availability: {
    type: String,
    enum: Object.keys(AVAILABILITY),
    default: AVAILABILITY_UNDEFINED,
    required: true,
  },
  available_days_per_week: {
    type: Number,
    min: [MIN_DAYS_PER_WEEK, `Vous devez sélectionner entre ${MIN_DAYS_PER_WEEK} et ${MAX_DAYS_PER_WEEK} jours de disponibilité par semaine`],
    max: [MAX_DAYS_PER_WEEK, `Vous devez sélectionner entre ${MIN_DAYS_PER_WEEK} et ${MAX_DAYS_PER_WEEK} jours de disponibilité par semaine`],
    // Required if available or (not available and start date)
    required: [function() {
      return this.availability==AVAILABILITY_ON || (this.availability==AVAILABILITY_ON && !!this.available_from)
    }, `Vous devez indiquer des jours de disponibilité`]
  },
  // TODO: set to AVAILABILITY_ON when available_from is reached
  available_from: {
    type: Date,
    validate: [function(value) { return moment(value).isAfter(moment())}, `La date de disponibilité doit être dans le futur`],
    required: false,
  },
  // END AVAILABILITY
  // Soft skills
  gold_soft_skills: {
    type: [{type: String,enum: Object.keys(SS_THEMES),}],
    validate: [skills => skills?.length<MAX_GOLD_SOFT_SKILLS, `Vous pouvez choisir jusqu'à ${MAX_GOLD_SOFT_SKILLS} compétence(s)`]
  },
  silver_soft_skills: {
    type: [{type: String,enum: Object.keys(SS_THEMES),}],
    validate: [skills => skills?.length<MAX_SILVER_SOFT_SKILLS, `Vous pouvez choisir jusqu'à ${MAX_SILVER_SOFT_SKILLS} compétence(s)`]
  },
  bronze_soft_skills: {
    type: [{type: String,enum: Object.keys(SS_THEMES),}],
    validate: [skills => skills?.length<MAX_BRONZE_SOFT_SKILLS, `Vous pouvez choisir jusqu'à ${MAX_BRONZE_SOFT_SKILLS} compétence(s)`]
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
  ref: 'certification',
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
  ref: 'software',
  localField: '_id',
  foreignField: 'user',
})

FreelanceSchema.virtual('availability_str', DUMMY_REF).get(function() {
  switch(this.availability) {
    case AVAILABILITY_ON: return `Disponible ${this.available_days_per_week} jours par semaine`
    case AVAILABILITY_OFF: return this.available_from ? `Disponible ${this.available_days_per_week} jours par semaine à partir du ${moment(this.available_from).format('DD/MM/YY')} ` : 'Indisponible'
  }
  return `Disponibilité non renseignée`
})


/* eslint-enable prefer-arrow-callback */

module.exports = FreelanceSchema
