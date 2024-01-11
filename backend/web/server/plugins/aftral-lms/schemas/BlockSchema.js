const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')
const lodash=require('lodash')
const { formatDuration } = require('../../../../utils/text')

const BlockSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligzatoire`],
  },
  code: {
    type: [String],
    required: [true, `Le nom est obligzatoire`],
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
  ordered_chilren: {
    type: Boolean,
    default: false,
    required:[true, 'Indiquer si les enfants doivent être ordonnés']
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})
BlockSchema.virtual('duration_str').get(function(value) {
  return formatDuration(this.duration)
})


BlockSchema.virtual('order').get(function() {
  return 0
})

module.exports = BlockSchema
