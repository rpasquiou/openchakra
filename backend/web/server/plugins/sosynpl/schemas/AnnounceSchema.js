const mongoose = require('mongoose')
const lodash = require('lodash')
const moment = require('moment')
const autoIncrement = require('mongoose-auto-increment')
const {DURATION_UNIT, ANNOUNCE_MOBILITY, MOBILITY_NONE, COMMISSION, SS_PILAR, ANNOUNCE_STATUS_DRAFT, EXPERIENCE, ANNOUNCE_STATUS_ACTIVE, DURATION_UNIT_WORK_DAYS, ANNOUNCE_STATUS, DURATION_UNIT_DAYS, APPLICATION_STATUS_SENT} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')
const AddressSchema = require('../../../models/AddressSchema')
const { DUMMY_REF } = require('../../../utils/database')
const { computePilar } = require('../soft_skills')

const Schema = mongoose.Schema

const MIN_EXPERIENCES=1
const MIN_SECTORS=1
const MIN_HOMEWORK=0
const MAX_HOMEWORK=5
const MIN_SOFT_SKILLS=1
const MIN_EXPERTISES=3
const MAX_EXPERTISES=30
const MIN_PINNED_EXPERTISES=1
const MAX_PINNED_EXPERTISES=3
const MIN_SOFTWARES=1
const MIN_LANGUAGES=1

const MAX_GOLD_SOFT_SKILLS=1
const MAX_SILVER_SOFT_SKILLS=2
const MAX_BRONZE_SOFT_SKILLS=3

const AnnounceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
    required: [true, 'Le client est obligatoire'],
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: 'job',
    required: false,
  },
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
  },
  experience: {
    type: [{
      type: String,
      enum: Object.keys(EXPERIENCE),
      required: true,
    }],
    validate: [
      function(experiences) {return experiences?.length>0},
      `Vous devez choisir au moins ${MIN_EXPERIENCES} expérience(s)`,
    ],
    default: [],
    required: true,
  },
  duration: {
    type: Number,
    required: [true, `La durée est obligatoire`]
  },
  duration_unit: {
    type: String,
    enum: Object.keys(DURATION_UNIT),
    required: [true, `L'unité de durée est obligatoire`]
  },
  start_date: {
    type: Date,
    required: false,
  },
  sectors: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'sector',
      required: true,
    }],
    validate: [
      function(sectors) {return sectors?.length>0},
      `Vous devez choisir au moins ${MIN_SECTORS} secteur(s)`,
    ],
    default: [],
    required: true,
  },
  city: {
    type: AddressSchema,
    required: [true, `La ville est obligatoire`]
  },
  homework_days: {
    type: Number,
    min: [MIN_HOMEWORK, `Le nombre de jours de télétravail minimum est ${MIN_HOMEWORK}`],
    max: [MAX_HOMEWORK, `Le nombre de jours de télétravail maximum est ${MAX_HOMEWORK}`],
    default: 0,
    required: [true, `Le nombre de jours de télétravail est obligatoire`]
  },
  mobility: {
    type: String,
    enum: Object.keys(ANNOUNCE_MOBILITY),
    required: [true, `La mobilité est obligatoire`]
  },
  mobility_days_per_month: {
    type: Number,
    required: [function() { return this.mobility!=MOBILITY_NONE}, `Le nombre de jours de déplacements par mois est obligatoire`],
  },
  budget: {
    type: Number,
    required: [true, `Le budget est obligatoire`]
  },
  budget_hidden: {
    type: Boolean,
    default: false,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  delivery: {
    type: String,
    required: false,
  },
  challenge: {
    type: String,
    required: false,
  },
  expectation: {
    type: String,
    required: false,
  },
  expertises: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'expertise',
    }],
    validate: [
      function(expertises) {return lodash.inRange(expertises?.length, MIN_EXPERTISES, MAX_EXPERTISES+1)},
      `Vous devez choisir entre ${MIN_EXPERTISES} et ${MAX_EXPERTISES} compétences`,
    ],
    default: [],
    required: true,
  },
  pinned_expertises: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'expertise',
    }],
    validate: [
      expertises => lodash.inRange(expertises?.length, MIN_PINNED_EXPERTISES, MAX_PINNED_EXPERTISES+1),
      `Vous devez mettre en avant de ${MIN_PINNED_EXPERTISES} à de ${MAX_PINNED_EXPERTISES} compétences` 
    ],
    default: [],
    required: true,
  },
  company_description: {
    type: String,
    required: false,
  },
  team_description: {
    type: String,
    required: false,
  },
  team_picture: {
    type: String,
    required: false,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  softwares: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'software',
      required: true,
    }],
    validate: [softwares => softwares?.length>=MIN_SOFTWARES, `Vous devez choisir au moins ${MIN_SOFTWARES} logiciels(s)`],
    required: [true, `Les logiciels sont obligatoires`],
  },
  accepted_application: {
    type: Schema.Types.ObjectId,
    ref: 'application',
    required: false,
  },
  publication_date: {
    type: Date,
    default: null,
  },
  languages: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'languageLevel',
      required: true,
    }],
    validate: [languages => languages?.length>=MIN_LANGUAGES, `Vous devez choisir au moins ${MIN_LANGUAGES} langue(s)`],
    required: [true, `Les langues sont obligatoires`],
  },
  suggested_freelances: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'customerFreelance',
      required: true,
    }],
  },
  selected_freelances: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'customerFreelance',
      required: true,
    }],
  },
  // Soft skills
  gold_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
    default: [],
    validate: [skills => skills?.length<=MAX_GOLD_SOFT_SKILLS, `Vous pouvez choisir jusqu'à ${MAX_GOLD_SOFT_SKILLS} compétence(s)`]
  },
  silver_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
    default: [],
    validate: [skills => skills?.length<=MAX_SILVER_SOFT_SKILLS, `Vous pouvez choisir jusqu'à ${MAX_SILVER_SOFT_SKILLS} compétence(s)`]
  },
  bronze_soft_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'softSkill',
      required: true,
    }],
    default: [],
    validate: [skills => skills?.length<=MAX_BRONZE_SOFT_SKILLS, `Vous pouvez choisir jusqu'à ${MAX_BRONZE_SOFT_SKILLS} compétence(s)`]
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
  _counter: {
    type: Number,
  },
  status: {
    type: String,
    enum: Object.keys(ANNOUNCE_STATUS),
    default: ANNOUNCE_STATUS_DRAFT,
    required: true,
  },
}, schemaOptions)

AnnounceSchema.virtual('total_budget', DUMMY_REF).get(function() {
  return lodash.isNil(this.budget) ? null : this.budget*(1+COMMISSION)
})

AnnounceSchema.virtual('received_applications', {
  ref: 'application',
  foreignField: 'announce',
  localField: '_id',
  match: {
    status: APPLICATION_STATUS_SENT,
  },
})

AnnounceSchema.virtual('received_applications_count', {
  ref: 'application',
  foreignField: 'announce',
  localField: '_id',
  match: {
    status: APPLICATION_STATUS_SENT,
  },
  count: true,
})

AnnounceSchema.virtual('average_daily_rate', DUMMY_REF).get(function() {
  if (!!this.duration && !!this.duration_unit && !!this.budget) {
    return this.budget/(this.duration*DURATION_UNIT_WORK_DAYS[this.duration_unit])
  }
  return null
})

// Implement virtual for each pilar
Object.keys(SS_PILAR).forEach(pilar => {
  const virtualName=pilar.replace(/^SS_/, '').toLowerCase()
  AnnounceSchema.virtual(virtualName, DUMMY_REF).get(function() {
    return computePilar(this, pilar)
  })
})

// Manage announce serial number
if (mongoose.connection) {
  autoIncrement.initialize(mongoose.connection) // Ensure autoincrement is initalized
}

AnnounceSchema.plugin(autoIncrement.plugin, { model: 'announce', field: '_counter', startAt: 1});

AnnounceSchema.virtual('serial_number', DUMMY_REF).get(function() {
  if (!this._counter) {
    return undefined
  }
  return `A${moment().format('YY')}${this._counter.toString().padStart(5, 0)}`
})

AnnounceSchema.virtual('_duration_days', DUMMY_REF).get(function() {
  if (!this.duration || !this.duration_unit) {
    return null
  }
  return this.duration*DURATION_UNIT_DAYS[this.duration_unit]
})

module.exports = AnnounceSchema
