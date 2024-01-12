const mongoose = require('mongoose')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')
const { formatDuration } = require('../../../../utils/text')
const { THUMBNAILS_DIR } = require('../../../../utils/consts')
const { childSchemas } = require('./ResourceSchema')

const BlockSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  code: {
    type: String,
    required: false,
  },
  description: {
    type: [String],
    required: false,
  },
  picture: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    required: [function(){return this.type=='resource'}, `La durée est obligatoire`]
  },
  children: {
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
    default: true,
    required:[true, `La notion d'ordre est obligatoire`]
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})
BlockSchema.virtual('duration_str').get(function(value) {
  return formatDuration(this.duration)
})


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

module.exports = BlockSchema
