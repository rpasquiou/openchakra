const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')
const lodash=require('lodash')
const { formatDuration } = require('../../../../utils/text')

const BlockSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  code: {
    type: [String],
    required: [true, `Le code est obligatoire`],
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
    required: false,
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

module.exports = BlockSchema
