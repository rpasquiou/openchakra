const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ANSWER_NO, ANSWERS } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

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
        type: String,
        enum: Object.keys(ANSWERS),
        required: true
      }
    }]
  },
  global_rate: {
    type: Number,
    default: false
  },
  category_rates: {
    type: [{
      question_category: {
        type: Schema.Types.ObjectId,
        ref: 'questionCategory',
        required: true
      },
      category_rate: {
        type: Number,
        required: true
      }
    }],
    default: []
  },
  bellwether_rates: {
    type: [{
      question_category: {
        type: Schema.Types.ObjectId,
        ref: 'questionCategory',
        required: true
      },
      category_rate: {
        type: Number,
        required: true
      }
    }],
    default: []
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

ScoreSchema.virtual('deviation', DUMMY_REF).get(function() {
  return this?.questions.filter(q => q.answer==ANSWER_NO).length || 0
})

/* eslint-enable prefer-arrow-callback */

module.exports = ScoreSchema