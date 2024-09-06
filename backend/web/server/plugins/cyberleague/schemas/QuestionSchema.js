const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const QuestionSchema = new Schema({
  text: {
    type: String,
    required: [true, `Le texte de la question est obligatoire`],
  },
  weight: {
    type: Number,
    validate: [function(s) {s => [1,2,3].includes(s)}, 'Le poids doit être 1, 2 ou 3'],
    required: [true, `Le poids de la question est obligatoire`],
  },
  question_category: {
    type: Schema.Types.ObjectId,
    ref: 'questionCategory',
    required: [true, `La catégorie de la question est obligatoire`]
  },
  is_bellwether: {
    type: Boolean,
    required: [true, `Il est obligatoire de préciser si la question appartient au baromètre`]
  },
  is_level_1: {
    type: Boolean,
    required: [function (s) {return (!this.is_level_2 && !this.is_level_3)}, `La question doit être affectée à au moins un niveau de questionnaire`]
  },
  is_level_2: {
    type: Boolean,
    required: [function (s) {return (!this.is_level_1 && !this.is_level_3)}, `La question doit être affectée à au moins un niveau de questionnaire`]
  },
  is_level_3: {
    type: Boolean,
    required: [function (s) {return (!this.is_level_2 && !this.is_level_1)}, `La question doit être affectée à au moins un niveau de questionnaire`]
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = QuestionSchema