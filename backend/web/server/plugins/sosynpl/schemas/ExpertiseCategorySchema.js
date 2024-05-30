const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ExpertiseCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'expertiseCategory',
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
ExpertiseCategorySchema.virtual('children', {
  ref: 'expertiseCategory', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'parent', // is equal to foreignField
})

ExpertiseCategorySchema.virtual('expertises', {
  ref: 'expertise', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'category', // is equal to foreignField
})
/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseCategorySchema
