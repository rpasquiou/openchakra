const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const EvaluationSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur de l'avis est obligatoire`]
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: [true, `L'événement évalué est obligatoire`]
  },
  date: {
    type: Date,
    required: false
  },
  global_rate: {
    type: Number,
    validate: [value => value <6 && value >0, `La note globale doit être entre 1 et 5`],
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = EvaluationSchema