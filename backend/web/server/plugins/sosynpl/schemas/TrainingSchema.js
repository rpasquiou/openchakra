const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const TrainingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'freelance',
    require: [true, `Le freelance est obligatoire`],
  },
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
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
    required: [true, `La description est obligatoire`],
  },
  school_name: {
    type: String,
    required: [true, `L'école est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = TrainingSchema