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
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = EvaluationSchema