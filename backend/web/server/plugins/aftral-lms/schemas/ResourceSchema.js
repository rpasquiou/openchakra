const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE, ACHIEVEMENT_RULE, ACHIEVEMENT_RULE_HOMEWORK, ACHIEVEMENT_RULE_SUCCESS, RESOURCE_TYPE_SCORM}=require('../consts')

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
  _evaluation: {
    type: Boolean,
    required: false,
  },
  optional: {
    type: Boolean,
    default: false,
    required: [true, `Le caractère optionnel est obligatoire`],
  },
  mine: {
    type: Boolean,
  },
  achievement_rule: {
    type: String,
    enum: Object.keys(ACHIEVEMENT_RULE),
    require: false,
  },
  success_note: {
    type: Number,
    required: [
      function() {this.ACHIEVEMENT_RULE==ACHIEVEMENT_RULE_SUCCESS && this.resource_type!=RESOURCE_TYPE_SCORM}, 
      `La note de réussite est obligatoire`
    ],
  },
  // computed
  homeworks: [{
    type: Schema.Types.ObjectId,
    ref: 'homework',
  }],
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ResourceSchema.virtual('evaluation').get(function(value) {
  return this._evaluation
})

ResourceSchema.virtual('evaluation').set(function(value) {
  this._evaluation=value
})

ResourceSchema.virtual('has_homework').get(function(value) {
  if (this.achievement_rule==ACHIEVEMENT_RULE_HOMEWORK) {
    return true
  }
  if (this.achievement_rule==ACHIEVEMENT_RULE_SUCCESS && this.resource_type==RESOURCE_TYPE_SCORM) {
    return true
  }
  return false
})

module.exports = ResourceSchema
