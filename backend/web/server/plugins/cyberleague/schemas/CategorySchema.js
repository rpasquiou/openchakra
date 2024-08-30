const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { CATEGORIES } = require('../consts')

const Schema = mongoose.Schema

const CategorySchema = new Schema({
  name: {
    type: String,
    enum: Object.keys(CATEGORIES),
    required: [true, 'Le nom est obligatoire'],
  },
  picture: {
    type: String,
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

CategorySchema.virtual('expertises', {
  ref: "expertise", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "category" // is equal to foreignField
})

/* eslint-enable prefer-arrow-callback */

module.exports = CategorySchema