const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const TrainingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'member',
    require: [true, `Le membre est obligatoire`],
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
    required: false,
  },
  expertises: {
    type: Schema.Types.ObjectId,
    ref: 'expertise',
    required: [true, `L' expertise est obligatoire`]
  },
  level: {
    type: Number,
    required: [true, `Le niveau d'expertise est obligatoire`]
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

TrainingSchema.virtual('duration', DUMMY_REF).get(function () {
    return moment(this.end_date).diff(this.start_date, 'minutes')
  })
module.exports = TrainingSchema