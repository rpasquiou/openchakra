const mongoose = require('mongoose')
const {QUESTION_TYPE} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const QuestionSchema = new Schema({
  quizz: {
    type: Schema.Types.ObjectId,
    ref: 'quizz',
    required: [true, `Le quizz est obligatoire`],
  },
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
  },
  type: {
    type: String,
    enum: Object.keys(QUESTION_TYPE),
    required: [true, 'Le type est obligatoire'],
  },
  // The correct answer for a single QCM
  correct_answers: [{
    type: Schema.Types.ObjectId,
    ref: 'answer',
    required: false,
  }],
  success_message: {
    type: String,
    required: false,
  },
  error_message: {
    type: String,
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
QuestionSchema.virtual('available_answers', {
  ref: 'answer', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'question', // is equal to foreignField
})

QuestionSchema.virtual('user_choice_answers', {localField: 'tagada', foreignField: 'tagada'}).get(function() {
  return []
})

QuestionSchema.virtual('user_text_answer').get(function() {
  return ''
})

QuestionSchema.virtual('user_numeric_answer').get(function() {
  return 0
})

/** Was the answer correct ? */
QuestionSchema.virtual('correct').get(function() {
  return true
})

/** Success or error message depending on correctness */
QuestionSchema.virtual('message').get(function() {
  return ''
})


/* eslint-enable prefer-arrow-callback */


module.exports = QuestionSchema
