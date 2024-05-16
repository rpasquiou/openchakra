const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const HardSkillCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'hardSkillCategory',
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
HardSkillCategorySchema.virtual('children', {
  ref: 'hardSkillCategory', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'parent', // is equal to foreignField
})

HardSkillCategorySchema.virtual('skills', {
  ref: 'hardSkill', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'category', // is equal to foreignField
})
/* eslint-enable prefer-arrow-callback */

module.exports = HardSkillCategorySchema
