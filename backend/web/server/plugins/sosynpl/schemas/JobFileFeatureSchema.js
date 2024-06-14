const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const JobFileFeatureSchema = new Schema({
  job_file: {
    type: Schema.Types.ObjectId,
    ref: 'jobFile',
    required: [true, `La fiche métier est obligatoire`],
  },
  description: {
    type: String,
    required: [true, `La description est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = JobFileFeatureSchema
