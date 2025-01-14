const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const customerSchema=require('./CustomerSchema')
const AddressSchema = require('../../../models/AddressSchema')
const {COMPANY_SIZE, WORK_DURATION, SOURCE, SOSYNPL, DISCRIMINATOR_KEY, EXPERIENCE, ROLE_FREELANCE, ROLES, 
  MOBILITY, MOBILITY_REGIONS, MOBILITY_CITY, MOBILITY_FRANCE, AVAILABILITY, AVAILABILITY_UNDEFINED, AVAILABILITY_OFF, AVAILABILITY_ON, SS_MEDALS_GOLD, SS_MEDALS_SILVER, SS_MEDALS_BRONZE, SS_PILAR_CREATOR, SS_PILAR,
  CF_MAX_GOLD_SOFT_SKILLS,
  CF_MAX_SILVER_SOFT_SKILLS,
  CF_MAX_BRONZE_SOFT_SKILLS,
  ANNOUNCE_STATUS_ACTIVE,
  ANNOUNCE_STATUS_DRAFT,
  REPORT_STATUS_SENT,
  ANNOUNCE_STATUS_PROVIDED} = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const { REGIONS } = require('../../../../utils/consts')
const { computePilars, computePilar } = require('../soft_skills')
const {isPhoneOk, isEmailOk } = require('../../../../utils/sms')
const IBANValidator = require('iban-validator-js')
const {ROLE_CUSTOMER, LEGAL_STATUS, SUSPEND_REASON, DEACTIVATION_REASON, ACTIVITY_STATE, ACTIVITY_STATE_ACTIVE, ACTIVITY_STATE_STANDBY, ACTIVITY_STATE_SUSPENDED} = require('../consts')
const siret = require('siret')
const { NATIONALITIES } = require('../../../../utils/consts')
const {getApplications, getNotes, computeNotes} = require('../customerFreelance')
const { freelanceProfileCompletion, freelanceMissingAttributes } = require('../freelance')
const { customerProfileCompletion, customerMissingAttributes } = require('../customer')

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

const MIN_SOFTWARES=1

const MAX_EXPERTISES=30
const MAX_PINNED_EXPERTISES=3

const Schema = mongoose.Schema

 function isFreelance(user) {
  return user.role==ROLE_FREELANCE
 }
const CustomerFreelanceSchema = new Schema({
  ...customerSchema.obj,
  // Ovveride address => mandatory
  // For freelacne only
  headquarter_address: {
    type: AddressSchema,
    required: [function() {return isFreelance(this)}, `L'adresse est obligatoire`],
  },
  // Override role
  role: {
    type: String,
    enum: Object.keys(ROLES),
    default: ROLE_FREELANCE,
    required: [function() {return isFreelance(this)}, `Le rôle est obligatoire`],
    index: true,
  },
  main_job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: [function() {return isFreelance(this)}, `Le métier principal est obligatoire`],
  },
  main_experience: {
    type: String,
    enum: Object.keys(EXPERIENCE),
    required: [function() {return isFreelance(this)}, `L'expérience principale est obligatoire`],
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
    required: [function() {return isFreelance(this) && !!this.second_job}, `L'expérience du deuxième métier est obligatoire`],
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
    required: [function() {return isFreelance(this) && !!this.third_job}, `L'expérience du troisième métier est obligatoire`],
  },
  rate: {
    type: Number,
    validate: [v => !v || (parseInt(v)==v && v>1), `Le TJM doit être un nombre entier supérieur à 1€`],
    min: 1.0,
    required: false,
  },
  motivation: {
    type: String,
    required: [function() {return isFreelance(this)}, `Saisisez les types de missions recherchées`],
  },
  work_mode_remote: {
    type: Boolean,
    required: false,
  },
  work_mode_site: {
    type: Boolean,
    required: false,
  },
  // 1 minimum, 3 max
  work_duration: {
    type: [{
      type: String,
      enum: Object.keys(WORK_DURATION),
    }],
    validate: [
      function(durations) {return !isFreelance(this) ||  lodash.inRange(durations?.length, MIN_DURATIONS, MAX_DURATIONS+1)}, 
      `Vous devez choisir de ${MIN_DURATIONS} à ${MAX_DURATIONS} durées de mission` 
    ]
  },
  // 1 minimum, 5 max
  work_sector: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'sector',
    }],
    validate: [{
      validator: function(sectors) {return !isFreelance(this) || lodash.inRange(sectors?.length, MIN_SECTORS, MAX_SECTORS+1)}, 
      message: `Vous devez choisir de ${MIN_SECTORS} à ${MAX_SECTORS} secteurs d'activité` 
    },
    {
      validator: function(sectors) { return !isFreelance(this) || !sectors.some(s => lodash.isNil(s))}, 
      message: `Le secteur d'activité est obligatoire` 
    }]
  },
  work_company_size: {
    type: [{
      type: String,
      enum: Object.keys(COMPANY_SIZE),
    }],
  },
  experience: {
    type: String,
    required: [function() {return isFreelance(this)}, `L'expérience est obligatoire`],
  },
  professional_rc: {
    type: String,
    required: false,
  },
  linkedin: {
    type: String,
    required: [function() { return isFreelance(this) && !this.curriculum}, `Un lien Linkedin ou un CV est obligatoire`]
  },
  curriculum: {
    type: String,
    required: [function() { return isFreelance(this) && !this.linkedin}, `Un lien Linkedin ou un CV est obligatoire`]
  },
  source: {
    type: String,
    enum: Object.keys(SOURCE),
    required: [function() {return isFreelance(this)}, `Sélectionnez la manière dont vous avez connu ${SOSYNPL}`]
  },
  picture_visible: {
    type: Boolean,
    default: false,
    required: [function() {return isFreelance(this)}, `La visibilité de la photo est obligatoire`]
  },
  google_visible: {
    type: Boolean,
    default: true,
    required: [function() {return isFreelance(this)}, `La visibilité Google est obligatoire`]
  },
  admin_visible: {
    type: Boolean,
    default: false,
    required: false
  },
  hard_skills_categories: [{
    type: Schema.Types.ObjectId,
    ref: 'hardSkillCategory',
  }],
  expertises: [{
    type: Schema.Types.ObjectId,
    ref: 'expertise',
    validate: [
      function(expertises) {return !isFreelance(this) || !expertises.length || expertises.length > MAX_EXPERTISES}, 
      `Vous pouvez choisir jusqu'à ${MAX_EXPERTISES} compétences` 
    ],
  }],
  pinned_expertises: [{
    type: Schema.Types.ObjectId,
    ref: 'expertise',
    validate: [
      function(expertises) {return !isFreelance(this) || !expertises.length || expertises.length > MAX_PINNED_EXPERTISES}, 
      `Vous pouvez mettre en avant jusqu'à ${MAX_PINNED_EXPERTISES} compétences` 
    ],
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
    required: [function() {return isFreelance(this) && this.mobility==MOBILITY_REGIONS}, `Vous devez choisir de ${MIN_EXTRA_SKILLS} à ${MAX_EXTRA_SKILLS} régions`]
  },
  mobility_city: {
    type: AddressSchema,
    required: [function() {return isFreelance(this) && this.mobility==MOBILITY_CITY}, `Vous devez choisir une ville`]
  },
  mobility_city_distance: {
    type: Number,
    required: [function() {return isFreelance(this) && this.mobility==MOBILITY_CITY}, `Vous devez choisir une distance autour de la ville`]
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
    required: function() {return isFreelance(this)},
  },
  availability_last_update: {
    type: Date,
    required: false,
  },
  available_days_per_week: {
    type: Number,
    min: [MIN_DAYS_PER_WEEK, `Vous devez sélectionner entre ${MIN_DAYS_PER_WEEK} et ${MAX_DAYS_PER_WEEK} jours de disponibilité par semaine`],
    max: [MAX_DAYS_PER_WEEK, `Vous devez sélectionner entre ${MIN_DAYS_PER_WEEK} et ${MAX_DAYS_PER_WEEK} jours de disponibilité par semaine`],
    // Required if available or (not available and start date)
    required: [function() {
      return isFreelance(this) && (this.availability==AVAILABILITY_ON || (this.availability==AVAILABILITY_ON && !!this.available_from))
    }, `Vous devez indiquer des jours de disponibilité`]
  },
  // TODO: set to AVAILABILITY_ON when available_from is reached
  available_from: {
    type: Date,
    set: d => lodash.isNil(d) ? d : moment(d).startOf('day'),
    required: false,
  },
  // END AVAILABILITY
  // Soft skills
  gold_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
    default: [],
    validate: [function(skills) {return !isFreelance(this) || skills?.length<=CF_MAX_GOLD_SOFT_SKILLS}, `Vous pouvez choisir jusqu'à ${CF_MAX_GOLD_SOFT_SKILLS} compétence(s)`]
  },
  silver_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
    default: [],
    validate: [function(skills) {return !isFreelance(this) || skills?.length<=CF_MAX_SILVER_SOFT_SKILLS}, `Vous pouvez choisir jusqu'à ${CF_MAX_SILVER_SOFT_SKILLS} compétence(s)`]
  },
  bronze_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
    default: [],
    validate: [function(skills) { return !isFreelance(this) || skills?.length<=CF_MAX_BRONZE_SOFT_SKILLS}, `Vous pouvez choisir jusqu'à ${CF_MAX_BRONZE_SOFT_SKILLS} compétence(s)`]
  },
  // Computed depending on gold/silver/bronze soft skills
  available_gold_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
  },
  available_silver_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
  },
  available_bronze_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
  },
  softwares: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'software',
      required: true,
    }],
    default: [],
    required: false,
  },
  languages: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'languageLevel',
      required: true,
    }],
    default: [],
    required: false,
  },
  pinned_by: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'customerFreelance',
      required: false
    }],
    required: false,
    default: [],
  },
  pinned: {
    type: Boolean,
    required: false,
  },
  iban: {
    type: String,
    set: v => v ? v.replace(/\s/g, '') : v,
    validate: [v => !v || IBANValidator.isValid(v), v => `L'IBAN '${v.value}' est invalide`],
    required: false,
  },
  dedicated_admin: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false
    }],
    default: [],
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
  vigilance_certificate: {
    type: String,
    required: false,
  },
  kbis: {
    type: String,
    required: false,
  },
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */

CustomerFreelanceSchema.virtual('customer_missions', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'customer',
})

CustomerFreelanceSchema.virtual('freelance_missions', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'freelance',
})

CustomerFreelanceSchema.virtual('recommandations', {
  ref: 'recommandation',
  localField: '_id',
  foreignField: 'freelance',
})

CustomerFreelanceSchema.virtual('communications', {
  ref: 'communication',
  localField: '_id',
  foreignField: 'user',
})

CustomerFreelanceSchema.virtual('experiences', {
  ref: 'experience',
  localField: '_id',
  foreignField: 'user',
})

CustomerFreelanceSchema.virtual('certifications', {
  ref: 'certification',
  localField: '_id',
  foreignField: 'user',
})

CustomerFreelanceSchema.virtual('expertises_count', {
  ref: 'expertise',
  foreignField: '_id',
  localField: 'expertises',
  count: true,
})

CustomerFreelanceSchema.virtual('pinned_expertises_count', {
    ref: 'expertise',
    foreignField: '_id',
    localField: 'pinned_expertises',
    count: true,
})

CustomerFreelanceSchema.virtual('gold_soft_skills_count', {
    ref: 'softSkill',
    foreignField: '_id',
    localField: 'gold_soft_skills',
    count: true,
})

CustomerFreelanceSchema.virtual('silver_soft_skills_count', {
    ref: 'softSkill',
    foreignField: '_id',
    localField: 'silver_soft_skills',
    count: true,
})

CustomerFreelanceSchema.virtual('bronze_soft_skills_count', {
    ref: 'softSkill',
    foreignField: '_id',
    localField: 'bronze_soft_skills',
    count: true,
})

CustomerFreelanceSchema.virtual('trainings', {
  ref: 'training',
  localField: '_id',
  foreignField: 'user',
})

// Depends on filled attributes
CustomerFreelanceSchema.virtual('search_visible').get(function() {
  return false
})

CustomerFreelanceSchema.virtual('mobility_str', DUMMY_REF).get(function() {
  switch(this.mobility) {
    case MOBILITY_FRANCE: return MOBILITY[MOBILITY_FRANCE]
    case MOBILITY_REGIONS: return this.mobility_regions?.map(i => REGIONS[i]).join(',')
    case MOBILITY_CITY: return `${this.mobility_city.city} dans un rayon de ${this.mobility_city_distance} km`
  }
})

CustomerFreelanceSchema.virtual('availability_str', DUMMY_REF).get(function() {
  switch(this.availability) {
    case AVAILABILITY_ON: return `Disponible ${this.available_days_per_week} jour(s) par semaine`
    case AVAILABILITY_OFF: return this.available_from ? `Disponible ${this.available_days_per_week} jour(s) par semaine à partir du ${moment(this.available_from).format('DD/MM/YY')} ` : 'Indisponible'
  }
  return `Disponibilité non renseignée`
})

// Implement virtual for each pilar
Object.keys(SS_PILAR).forEach(pilar => {
  const virtualName=pilar.replace(/^SS_/, '').toLowerCase()
  CustomerFreelanceSchema.virtual(virtualName, DUMMY_REF).get(function() {
    return computePilar(this, pilar)
  })
})

// Customer : Announces I created
CustomerFreelanceSchema.virtual('announces', {
  ref: 'announce',
  localField: '_id',
  foreignField: 'user',
})

// Customer : Suggetsions I sent to frelance
CustomerFreelanceSchema.virtual('sent_suggestions', {
  ref: 'announceSuggestion',
  localField: '_id',
  foreignField: 'user',
})

// Freelance : Announces a customer suggested to me
CustomerFreelanceSchema.virtual('received_suggestions', {
  ref: 'announceSuggestion',
  localField: '_id',
  foreignField: 'freelance',
})

// Freelance : sent applications
CustomerFreelanceSchema.virtual('sent_applications', {
  ref: 'application',
  localField: '_id',
  foreignField: 'freelance',
})

CustomerFreelanceSchema.virtual('pinned_announces', {
  ref: 'announce',
  localField: '_id',
  foreignField: 'pinned_by',
})

CustomerFreelanceSchema.virtual('availability_update_days', DUMMY_REF).get(function(){
  return moment().diff(this.availability_last_update, 'days') || undefined
})

CustomerFreelanceSchema.virtual('received_suggestions_count', {
  ref: 'announceSuggestion',
  localField: '_id',
  foreignField: 'freelance',
  count: true,
})

CustomerFreelanceSchema.virtual('applications', DUMMY_REF).get(function(){/*return getApplications(this)*/})

CustomerFreelanceSchema.virtual('customer_evaluations', {
  ref: 'evaluation',
  localField: '_id',
  foreignField: 'customer',
})

CustomerFreelanceSchema.virtual('freelance_evaluations', {
  ref: 'evaluation',
  localField: '_id',
  foreignField: 'freelance',
})

CustomerFreelanceSchema.virtual('customer_average_note', DUMMY_REF).get(function(){
  return computeNotes(this, 'customer')
})

CustomerFreelanceSchema.virtual('freelance_average_note', DUMMY_REF).get(function(){
  return computeNotes(this, 'freelance')
})

CustomerFreelanceSchema.virtual('customer_evaluations_count', {
  ref: 'evaluation',
  localField: '_id',
  foreignField: 'customer',
  count: true,
})

CustomerFreelanceSchema.virtual('freelance_evaluations_count', {
  ref: 'evaluation',
  localField: '_id',
  foreignField: 'freelance',
  count: true,
})

CustomerFreelanceSchema.virtual('freelance_profile_completion', DUMMY_REF).get(function(){return freelanceProfileCompletion(this)})

CustomerFreelanceSchema.virtual('freelance_missing_attributes', DUMMY_REF).get(function(){return freelanceMissingAttributes(this)})

CustomerFreelanceSchema.virtual('customer_profile_completion', DUMMY_REF).get(function(){return customerProfileCompletion(this)})

CustomerFreelanceSchema.virtual('customer_missing_attributes', DUMMY_REF).get(function(){return customerMissingAttributes(this)})

CustomerFreelanceSchema.virtual('customer_reports', DUMMY_REF).get(function() {
  return this.customer_missions 
    ? Object.keys(this.customer_missions).map(key => this.customer_missions[key].reports).flat()
    : []
})

CustomerFreelanceSchema.virtual('freelance_reports', DUMMY_REF).get(function() {
  return this.freelance_missions 
    ? Object.keys(this.freelance_missions).map(key => this.freelance_missions[key].reports).flat()
    : []
})

CustomerFreelanceSchema.virtual('freelance_current_missions_count', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'freelance',
  match: {
    start_date: {$lt: new Date()},
    end_date: {$gt: new Date()},
  },
  count: true,
})

CustomerFreelanceSchema.virtual('customer_current_missions_count', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'customer',
  match: {
    start_date: {$lt: new Date()},
    end_date: {$gt: new Date()},
  },
  count: true,
})

CustomerFreelanceSchema.virtual('freelance_coming_missions_count', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'freelance',
  match: {
    start_date: {$gt: new Date()},
  },
  count: true,
})

CustomerFreelanceSchema.virtual('customer_coming_missions_count', {
  ref: 'mission',
  localField: '_id',
  foreignField: 'customer',
  match: {
    start_date: {$gt: new Date()},
  },
  count: true,
})

CustomerFreelanceSchema.virtual('customer_active_announces_count', {
  ref: 'announce',
  localField: '_id',
  foreignField: 'user',
  match: {
    status: ANNOUNCE_STATUS_ACTIVE,
  },
  count: true,
})

CustomerFreelanceSchema.virtual('customer_published_announces_count', {
  ref: 'announce',
  localField: '_id',
  foreignField: 'user',
  match: {
    status: {$ne:ANNOUNCE_STATUS_PROVIDED},
  },
  count: true,
})

CustomerFreelanceSchema.virtual('customer_received_applications_count', DUMMY_REF).get(function() {
  if(!this.announces) {
    return
  }
  return lodash.sumBy(this.announces,'received_applications_count')
})


CustomerFreelanceSchema.virtual('customer_sent_reports_count', DUMMY_REF).get(function() {
  return this.customer_missions 
    ? Object.keys(this.customer_missions)
        .map(key => this.customer_missions[key].reports)
        .flat()
        .filter(report => report && report.status === REPORT_STATUS_SENT).length
    : 0
})

CustomerFreelanceSchema.virtual('search_field', DUMMY_REF).get(function() {
  let fields = [this.position]

  if (this.expertises) {
    fields = fields.concat(this.expertises.map(e => e.name))
  }

  if (this.main_job) {
    fields.push(this.main_job.name)
  }

  if (this.second_job) {
    fields.push(this.second_job.name)
  }

  if (this.third_job) {
    fields.push(this.third_job.name)
  }

  if (this.pinned_expertises) {
    fields = fields.concat(this.pinned_expertises.map(e => e.name))
  }

  if (this.work_mode_remote) {
    fields.push(this.work_mode_remote)
  }

  if (this.work_mode_site) {
    fields.push(this.work_mode_site)
  }

  return fields.join(' ')
})

CustomerFreelanceSchema.pre('save', function (next) {
  if (!(lodash.isNil(this.work_mode_remote) && lodash.isNil(this.work_mode_site))) {
    this.work_mode_remote = this.work_mode_remote || false
    this.work_mode_site = this.work_mode_site || false
  }
  next()
})

CustomerFreelanceSchema.virtual('asked_questions', {
  ref: 'question',
  localField: '_id',
  foreignField: 'creator',
})

/* eslint-enable prefer-arrow-callback */


module.exports = CustomerFreelanceSchema

