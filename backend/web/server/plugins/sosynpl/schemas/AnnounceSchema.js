const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const {DURATION_UNIT, ANNOUNCE_MOBILITY, MOBILITY_NONE, COMMISSION, SS_PILAR, ANNOUNCE_STATUS_DRAFT, EXPERIENCE, ANNOUNCE_STATUS_ACTIVE, DURATION_UNIT_DAYS} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')
const AddressSchema = require('../../../models/AddressSchema')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const MIN_EXPERIENCES=1
const MIN_SECTORS=1
const MIN_HOMEWORK=0
const MAX_HOMEWORK=5
const MIN_SOFT_SKILLS=1
const MIN_HARD_SKILLS=1
const MIN_EXPERTISE=3
const MIN_SOFTWARES=1
const MIN_LANGUAGES=1

const AnnounceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'customer',
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
  budget_visible: {
    type: Boolean,
    default: true,
    required: [true, `La visibilité du budget doit être indiquée`],
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
  soft_skills: {
    type: [{
      type: String,
      enum: Object.keys(SS_PILAR),
    }],
    validate: [
      function(pilars) {return pilars?.length>=MIN_SOFT_SKILLS},
      `Vous devez choisir au moins ${MIN_SOFT_SKILLS} soft skill(s)`,
    ],
    default: [],
    required: true,
  },
  hard_skills: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'hardSkill',
    }],
    validate: [
      function(hard_skills) {return hard_skills?.length>=MIN_HARD_SKILLS},
      `Vous devez choisir au moins ${MIN_HARD_SKILLS} compétence(s)`,
    ],
    default: [],
    required: true,
  },
  expertises: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'expertise',
    }],
    validate: [
      function(expertises) {return expertises?.length>=MIN_EXPERTISE},
      `Vous devez choisir au moins ${MIN_EXPERTISE} expertise(s)`,
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
    required: [true, `Les logiviels sont obligatoires`],
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
      ref: 'freelance',
      required: true,
    }],
  },
  selected_freelances: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'freelance',
      required: true,
    }],
  },
}, schemaOptions)

AnnounceSchema.virtual('total_budget', DUMMY_REF).get(function() {
  return this.budget*COMMISSION
})

AnnounceSchema.virtual('status', DUMMY_REF).get(function() {
  return this.publication_date ? ANNOUNCE_STATUS_ACTIVE : ANNOUNCE_STATUS_DRAFT
})

AnnounceSchema.virtual('applications', {
  ref: 'application',
  foreignField: 'announce',
  localField: '_id',
})

AnnounceSchema.virtual('applications_count', {
  ref: 'application',
  foreignField: 'announce',
  localField: '_id',
  count: true,
})

AnnounceSchema.virtual('average_daily_rate', DUMMY_REF).get(function() {
  if (!!this.duration && !!this.duration_unit && !!this.budget) {
    return this.budget/(this.duration*DURATION_UNIT_DAYS[this.duration_unit])
  }
  return null
})

module.exports = AnnounceSchema
