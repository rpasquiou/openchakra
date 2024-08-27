const mongoose = require('mongoose')
const moment = require('moment')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, BLOCK_STATUS,RESOURCE_TYPE, ACHIEVEMENT_RULE_SUCCESS, RESOURCE_TYPE_SCORM, ACHIEVEMENT_RULE, AVAILABLE_ACHIEVEMENT_RULES}=require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const { getAttribute } = require('../block')
const { BadRequestError } = require('../../../utils/errors')

const BlockSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur est obligatoire`],
  },
  last_updater: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  name: {
    type: String,
    required: [function()  {return (!!this._locked || !this.origin)}, `Le nom est obligatoire`],
    index: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required: [function(){ return !!this.origin}, `Le parent est obligatoire`],
    index: true,
  },
  order: {
    type: Number,
    required: [function() { return this.parent}, `L'ordre est obligatoire`]
  },
  code: {
    type: String,
    default: null,
    required: false,
  },
  description: {
    type: String,
    default: null,
    required: false,
  },
  picture: {
    type: String,
    default: null,
    required: false,
  },
  // Closed: must finish children in order
  closed: {
    type: Boolean,
    default: null,
    required: false,
  },
  masked: {
    type: Boolean,
    default: null,
    required: false,
  },
  optional: {
    type: Boolean,
    default: null,
    required: false,
  },
  origin: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    index: true,
    required:false,
  },
  // TODO Compute actual status
  achievement_status: {
    type: String,
    enum: Object.keys(BLOCK_STATUS),
    set: v => v || undefined,
    required: false,
  },
  url: {
    type: String,
    default: null,
    required: [function() {return this.type=='resource' && (!!this._locked || !this.origin)}, `L'url est obligatoire`],
  },
  resource_type: {
    type: String,
    enum: Object.keys(RESOURCE_TYPE),
    required: [function(){ return this.type=='resource' && (!!this._locked || !this.origin)}, `Le type de ressource est obligatoire`],
  },
  spent_time: {
    type: Number,
  },
  spent_time_str: {
    type: String,
  },
  resources_count: {
    type: Number,
  },
  finished_resources_count: {
    type: Number,
  },
  resources_progress: {
    type: Number,
  },
  _locked: {
    type: Boolean,
    default: false,
    required: [true, `Le status verrouillagee est obligatoire`]
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'session',
    required:false,
  },
  // Annotation set by trainee
  annotation: {
    type: String,
  },
  access_condition: {
    type: Boolean,
  },
  // Annotation set by trainee
  success_message: {
    type: String,
  },
  badges: [{
    type: Schema.Types.ObjectId,
    ref: 'badge',
  }],
  obtained_badges: [{
    type: Schema.Types.ObjectId,
    ref: 'badge',
  }],
  achievement_rule: {
    type: String,
    enum: Object.keys(ACHIEVEMENT_RULE),
    set: v => v || undefined,
    required: [function() {return this.type=='resource' && (!!this._locked || !this.origin)}, `La règle d'achèvement est obligatoire`],
  },
  success_note_min: {
    type: Number,
  },
  success_note_max: {
    type: Number,
  },
  success_scale: {
    type: Boolean,
  },
  //Mode devoir
  homework_mode: {
    type: Boolean,
    required: false,
  },
  // computed
  homeworks: [{
    type: Schema.Types.ObjectId,
    ref: 'homework',
  }],
  max_attempts: {
    type: Number,
    set: v => v || null,
    required: false,
  },
  // Duration in seconds
  duration: {
    type: Number,
    set: function(v) {
      return this.type=='resource' ? v : undefined
    }
  },
  // This resource will be included in notes report
  evaluation: {
    type: Boolean,
    default: null,
    required:false,
  },
  used_in: [{
    type: Schema.Types.ObjectId,
    ref: 'path',
  }],
  liked: {
    type: Boolean,
    required: true,
    default: false,
  },
  disliked: {
    type: Boolean,
    default: false,
    required: true,
  },
  _liked_by:{ 
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: []
  },
  _disliked_by:{ 
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: []
  },
  codes: [{
    type: Schema.Types.ObjectId,
    ref: 'productCode',
  }],
  available_codes: [{
    type: Schema.Types.ObjectId,
    ref: 'productCode'
  }],
  //computed
  homeworks: [{
    type: Schema.Types.ObjectId,
    ref: 'homework'
  }],
  homework_limit_date: {
    type: Date,
    required: false,
  },
  //computed
  homeworks_submitted_count: {
    type: Number,
    required: false
  },
  homeworks_missing_count: {
    type: Number,
    required: false,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

BlockSchema.virtual('is_template', DUMMY_REF).get(function() {
  return !this.origin
})

BlockSchema.virtual('children', {
  ref: 'block',
  localField: '_id',
  foreignField: 'parent',
  options: {sort: 'order'}
})

BlockSchema.virtual('children_count', {
  ref: 'block',
  localField: '_id',
  foreignField: 'parent',
  count: true,
})

BlockSchema.virtual('search_text', {localField: 'tagada', foreignField: 'tagada'}).get(function() {
  return `${this.name} ${this.code}`
})

BlockSchema.virtual('likes_count', DUMMY_REF).get(function(){
  return this._liked_by?.length || 0
})

BlockSchema.virtual('dislikes_count', DUMMY_REF).get(function(){
  return this._disliked_by?.length || 0
})

BlockSchema.virtual('tickets', {
  ref: 'ticket',
  localField: '_id',
  foreignField: 'block',
})

BlockSchema.virtual('tickets_count', {
  ref: 'ticket',
  localField: '_id',
  foreignField: 'block',
  count: true,
})

BlockSchema.virtual('homework_limit_str', DUMMY_REF).get(function() {
  return this.homework_limit_date
    ? moment(this.homework_limit_date).format('DD/MM/YYYY à HH:mm')
    : ``
})

BlockSchema.virtual('can_upload_homework', DUMMY_REF).get(function() {
  if (!this.homework_mode) {
    return true
  }
  if (!this.homework_limit_date) {
    return true
  }
  const limitDate = moment(this.homework_limit_date)
  return limitDate.isAfter(moment())
})

// Validate Succes achievemnt
BlockSchema.pre('validate', async function(next) {
  // #36 Can't create two templates with same type and same name
  if (!this.origin && this.type=='resource' && !this.name) {
    const sameOne=await mongoose.models.block.findOne({_id: {$ne: this._id}, type: this.type, name: this.name, origin: null})
    if (sameOne) {
      return next(new Error(`Un modèle ${this.type} nommé "${this.name}" existe déjà ${this._id} ${sameOne._id}`))
    }
  }
  // If this is a type resource and achievement rule is success and this is not a scorm,
  // must select between min/max notes and scale
  if (!this._locked && this.type=='resource') {
    const resourceType= this.resource_type || await getAttribute('resource_type')(null, null, this)
    const allowedAchievementRules=AVAILABLE_ACHIEVEMENT_RULES[resourceType]
    // TODO allowedAchievementRules may be null if the block is not still inserted in DB
    if (this.achievement_rule && allowedAchievementRules &&  !allowedAchievementRules.includes(this.achievement_rule)) {
      const ruleName=ACHIEVEMENT_RULE[this.achievement_rule]
      const resourcetypeName=RESOURCE_TYPE[resourceType]
      throw new Error(`La règle d'achèvement ${ruleName} est invalide pour un ressource ${resourcetypeName}`)
    }
    if (this.achievement_rule==ACHIEVEMENT_RULE_SUCCESS && resourceType!=RESOURCE_TYPE_SCORM) {
      if (!this.success_scale) {
        if (!this.success_note_min) {
          return next(new Error(`La note minimale est obligatoire`))
        }
        if (!this.success_note_max) {
          return next(new Error(`La note maximale est obligatoire`))
        }
      }
    }
  }
  return next()
})

BlockSchema.virtual('plain_url', DUMMY_REF)

// BlockSchema.index(
//   { name: 1},
//   { unique: true, message: 'Un bkoc de même nom existe déjà' });

module.exports = BlockSchema
