const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CertificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
    require: [true, `Le freelance est obligatoire`],
  },
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
  },
  date: {
    type: Date,
    required: [true, `La date est obligatoire`],
  },
  description: {
    type: String,
    required: false,
  },
  school_name: {
    type: String,
    required: [true, `L'école est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CertificationSchema