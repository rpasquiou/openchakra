const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ANSWERS } = require('../consts')

const Schema = mongoose.Schema

const AnswerSchema = new Schema({
  score: {
    type: Schema.Types.ObjectId,
    ref: 'score',
    required: [true, `Le score est obligatoire dans la réponse`],
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'question',
    required: [true, `La question est obligatoire dans la réponse`],
  },
  answer: {
    type: String,
    enum: Object.keys(ANSWERS),
    required: false
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = AnswerSchema