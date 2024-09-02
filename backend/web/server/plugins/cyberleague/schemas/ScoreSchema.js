const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ScoreSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur du score est obligatoire`],
  },
  questions: {
    type: [{
      question: {
        type: Schema.Types.ObjectId,
        ref: 'question',
        required: true
      },
      answer: {
        type: Number,
        required: true
      }
    }]
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ScoreSchema