const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const TrainingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'member',
    require: [true, `Le membre est obligatoire`],
  },
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`],
  },
  end_date: {
    type: Date,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */
module.exports = TrainingSchema