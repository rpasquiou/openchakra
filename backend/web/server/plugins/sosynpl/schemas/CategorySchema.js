const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'category',
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
CategorySchema.virtual('children', {
  ref: 'category', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'parent', // is equal to foreignField
})

CategorySchema.virtual('skills', {
  ref: 'hardSkill', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'category', // is equal to foreignField
})
/* eslint-enable prefer-arrow-callback */

module.exports = CategorySchema
