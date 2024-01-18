const mongoose = require('mongoose')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, BLOCK_STATUS, BLOCK_STATUS_TO_COME, RESOURCE_TYPE}=require('../consts')
const { formatDuration, convertDuration } = require('../../../../utils/text')
const { THUMBNAILS_DIR } = require('../../../../utils/consts')
const { childSchemas } = require('./ResourceSchema')

function getterTemplateFirst(attribute) {
  function getter(v) {
    if (this.isTemplate()) {
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
    if (this.isTemplate()) {
      return v
    }
    throw new Error(`Setting ${attribute} forbidden`)
  }
  return setter
}

const BlockSchema = new Schema({
  name: {
    type: String,
    required: [function()  {return this.isTemplate()}, `Le nom est obligatoire`],
    get: getterTemplateFirst('name'),
    set: setterTemplateOnly('name')
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
  duration: {
    type: Number,
    required: [function(){return this.type=='resource' && this.isTemplate()}, `La durée est obligatoire`],
    set: v => convertDuration(v),
  },
  duration_str: {
    type: String,
    get: function() { return formatDuration(this.duration)},
  },
  actual_children: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'block',
      required:[true, `L'enfant est obligatoire`],
    }],
    required: true,
    default: [],
  },
  // Closed: must finish children in order
  closed: {
    type: Boolean,
    default: function() { return this.isTemplate() ? false : null},
    required:[function() { return this.isTemplate()}, `L'état fermé (O/N) est obligatoire`],
    get: getterMeFirst('closed'),
  },
  masked: {
    type: Boolean,
    default: function() { return this.isTemplate() ? false : null},
    required:[function() {return  this.isTemplate()}, `L'état masqué est obligatoire`],
    get: getterMeFirst('masked'),
  },
  optional: {
    type: Boolean,
    default: function() { return this.isTemplate() ? false : null},
    required:[function() {return  this.isTemplate()}, `L'état optionnel est obligatoire`],
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
    default: BLOCK_STATUS_TO_COME,
    required: [true, `Le status d'achèvement est obligatoire`],
    get : function(v) { this._locked ? null : v},
  },
  url: {
    type: String,
    required: [function() {return this.type=='resource' && this.isTemplate()}, `L'url est obligatoire`],
    get: getterTemplateFirst('url'),
  },
  resource_type: {
    type: String,
    enum: Object.keys(RESOURCE_TYPE),
    required: [function(){ return this.type=='resource' && this.isTemplate()}, `Le type de ressource est obligatoire`],
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
  search_text: {
    type: String,
    get: function() {return `${this.name} ${this.code}`}
  },
  _locked: {
    type: Boolean,
    default: false,
    required: [true, `Le status verrouillagee est obligatoire`]
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

BlockSchema.methods.isTemplate = function() {
  // console.log(`I'm a template`, !this.origin)
  return !this.origin
}

BlockSchema.virtual('order').get(function() {
  return 0
})

BlockSchema.virtual('children_count').get(function() {
  return this.children?.length || 0
})

BlockSchema.virtual('evaluation').get(function() {
  return this._evaluation
})

BlockSchema.virtual('evaluation').set(function(value) {
})

BlockSchema.virtual('children', {localField: 'tagada', foreignField: 'tagada'}).get(function() {
  return this.origin ? this.origin.children : this.actual_children
})

module.exports = BlockSchema
