const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const QuestionCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom de la question est obligatoire`],
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