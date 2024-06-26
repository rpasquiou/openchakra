const mongoose = require('mongoose')
const moment = require('moment')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, BLOCK_STATUS,RESOURCE_TYPE, ACHIEVEMENT_RULE_SUCCESS, RESOURCE_TYPE_SCORM, ACHIEVEMENT_RULE, ACHIEVEMENT_RULE_HOMEWORK}=require('../consts')
const { formatDuration, convertDuration } = require('../../../../utils/text')
const { THUMBNAILS_DIR } = require('../../../../utils/consts')
const { childSchemas } = require('./ResourceSchema')
const { DUMMY_REF } = require('../../../utils/database')

function getterTemplateFirst(attribute) {
  function getter(v) {
    if (!this.origin) {
      return v
    }
    return this.origin?.[attribute]
  }
  return getter
}

function getterMeFirst(attribute) {
  function getter(v) {
    if (lodash.isNil(v)) {
      return this.origin?.[attribute]
    }
    return v
  }
  return getter
}

function setterTemplateOnly(attribute) {
  function setter(v) {
    if (!this.origin) {
      return v
    }
    throw new Error(`Setting ${attribute} forbidden`)
  }
  return setter
}

const BlockSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
    index: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required: [function(){ return !!this.origin}, `Le parent est obligatoire`]
  },
  order: {
    type: Number,
    required: [function() { return this.parent}, `L'ordre est obligatoire`]
  },
  code: {
    type: String,
    required: false,
    get: getterTemplateFirst('code'),
    set: setterTemplateOnly('code')
  },
  description: {
    type: String,
    required: false,
    get: getterTemplateFirst('description'),
    set: setterTemplateOnly('description')
  },
  picture: {
    type: String,
    required: false,
    get: getterTemplateFirst('picture'),
    set: setterTemplateOnly('picture')
  },
  // Closed: must finish children in order
  closed: {
    type: Boolean,
    default: function() { return !this.origin ? false : null},
    required:[function() { return !this.origin}, `L'état fermé (O/N) est obligatoire`],
    get: getterMeFirst('closed'),
  },
  masked: {
    type: Boolean,
    default: function() { return !this.origin ? false : null},
    required:[function() {return  !this.origin}, `L'état masqué est obligatoire`],
    get: getterMeFirst('masked'),
  },
  optional: {
    type: Boolean,
    default: function() { return !this.origin ? false : null},
    required:[function() {return  !this.origin}, `L'état optionnel est obligatoire`],
    get: getterMeFirst('masked'),
  },
  origin: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required:false,
  },
  // TODO Compute actual status
  achievement_status: {
    type: String,
    enum: Object.keys(BLOCK_STATUS),
  },
  url: {
    type: String,
    required: [function() {return this?.type=='resource' && !this?.origin}, `L'url est obligatoire`],
    get: getterTemplateFirst('url'),
  },
  resource_type: {
    type: String,
    enum: Object.keys(RESOURCE_TYPE),
    required: [function(){ return this?.type=='resource' && !this?.origin}, `Le type de ressource est obligatoire`],
    get: getterTemplateFirst('resource_type'),
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
    set: function(v) {
      if (!this.origin) {
        throw new Error(`La condition d'accès n'est possible que si ce bloc a un parent`)
      }
      return v
    }
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
    require: false,
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

BlockSchema.virtual('evaluation', DUMMY_REF).get(function() {
  return this._evaluation
})

BlockSchema.virtual('evaluation', DUMMY_REF).set(function(value) {
})

BlockSchema.virtual('search_text', {localField: 'tagada', foreignField: 'tagada'}).get(function() {
  return `${this.name} ${this.code}`
})

BlockSchema.virtual('has_homework').get(function(value) {
  if (this.achievement_rule==ACHIEVEMENT_RULE_HOMEWORK) {
    return true
  }
  if (this.achievement_rule==ACHIEVEMENT_RULE_SUCCESS && this.resource_type==RESOURCE_TYPE_SCORM) {
    return true
  }
  return false
})

// Validate Succes achievemnt
BlockSchema.pre('validate', function(next) {
  // If this is a type resource and achievement rule is success and this is not a scorm,
  // must select between min/max notes and scale
  if (this.achievement_rule==ACHIEVEMENT_RULE_SUCCESS && this.resource_type!=RESOURCE_TYPE_SCORM) {
    if (!this.success_scale) {
      if (!this.success_note_min) {
        return next(new Error(`La note minimale est obligatoire`))
      }
      if (!this.success_note_max) {
        return next(new Error(`La note maximale est obligatoire`))
      }
    }
  }

  return next()
})

// BlockSchema.index(
//   { name: 1},
//   { unique: true, message: 'Un bkoc de même nom existe déjà' });

module.exports = BlockSchema
