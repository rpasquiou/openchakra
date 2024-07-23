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
    required: [function()  {return !this.origin}, `Le nom est obligatoire`],
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
    indx: true,
    required:false,
  },
  // TODO Compute actual status
  achievement_status: {
    type: String,
    enum: [null, ...Object.keys(BLOCK_STATUS)],
    set: v => v || undefined,
    default: null,
    required: false,
  },
  url: {
    type: String,
    default: null,
    required: [function() {return this?.type=='resource' && !this?.origin}, `L'url est obligatoire`],
  },
  resource_type: {
    type: String,
    enum: Object.keys(RESOURCE_TYPE),
    //required: [function(){ return this?.type=='resource' && !this?.origin}, function() {return `${this._id} Le type de ressource est obligatoire`}],
    required: [function(){ return this?.type=='resource' && !!this?._locked}, function() {return `${this._id} Le type de ressource est obligatoire`}],
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
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'block',
    }],
    required: true,
    default: [],
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
    required: [function() {return this.type=='resource' && !this.origin}, `La règle d'achèvement est obligatoire`],
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

// Validate Succes achievemnt
BlockSchema.pre('validate', async function(next) {
  // #36 Can't create two templates with same type and same name
  if (!this._locked) {
    const exists=!!this.name && await mongoose.models.block.exists({_id: {$ne: this._id}, type: this.type, name: this.name, origin: null})
    return next(new Error(`${this._id} Un modèle ${this.type} nommé "${this.name}" existe déjà`))
  }
  // If this is a type resource and achievement rule is success and this is not a scorm,
  // must select between min/max notes and scale
  if (!this._locked && this.type=='resource') {
    const resourceType=await getAttribute('resource_type')(null, null, this)
    console.log(this._id, 'achievemnt', this.achievement_rule, 'type', resourceType)
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
