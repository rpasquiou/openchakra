const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { QUESTION_CATEGORIES } = require('../consts')

const Schema = mongoose.Schema

const QuestionCategorySchema = new Schema({
  value: {
    type: String,
    enum: Object.keys(QUESTION_CATEGORIES),
    required: [true, 'La clé est obligatoire'],
  },
  name: {
    type: String,
    required: [true, `Le nom de la catégorie est obligatoire`],
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
QuestionCategorySchema.virtual('questions', {
  ref:'question',
  localField:'_id',
  foreignField:'question_category',
})
/* eslint-enable prefer-arrow-callback */

module.exports = QuestionCategorySchema