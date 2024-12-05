const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const EvaluationSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur de l'avis est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = EvaluationSchema