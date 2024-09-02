const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { EXPERTISE_CATEGORIES } = require('../consts')

const Schema = mongoose.Schema

const ExpertiseCategorySchema = new Schema({
  value: {
    type: String,
    enum: Object.keys(EXPERTISE_CATEGORIES),
    required: [true, 'La clé est obligatoire'],
  },
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  picture: {
    type: String,
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

ExpertiseCategorySchema.virtual('expertises', {
  ref: "expertise", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "category" // is equal to foreignField
})

/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseCategorySchema