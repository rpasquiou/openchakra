const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE, ACHIEVEMENT_RULE, ACHIEVEMENT_RULE_HOMEWORK, ACHIEVEMENT_RULE_SUCCESS, RESOURCE_TYPE_SCORM}=require('../consts')
const { number } = require('yargs')

const ResourceSchema = new Schema({
  shortName: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le créateur est obligatoire'],
  },
  optional: {
    type: Boolean,
    default: null,
    required: false,
  },
  mine: {
    type: Boolean,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = ResourceSchema
