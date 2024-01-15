const mongoose = require('mongoose')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')
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
    type: [String],
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
  open: {
    type: Boolean,
    default: function() { return this.isTemplate() ? true : null},
    required:[function() { return this.isTemplate()}, `L'état ouvert est obligatoire`],
    get: getterMeFirst('open'),
  },
  masked: {
    type: Boolean,
    default: function() { return this.isTemplate() ? false : null},
    required:[function() {return  this.isTemplate()}, `L'état masqué est obligatoire`],
    get: getterMeFirst('masked'),
  },
  origin: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required:false,
}
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

BlockSchema.virtual('resource_type').get(function() {
  return this._resource_type
})

BlockSchema.virtual('resource_type').set(function(value) {
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
