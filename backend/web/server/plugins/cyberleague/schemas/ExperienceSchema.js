const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ExperienceSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'utilisateur' est obligatoire`]
  },
  position: {
    type: String,
    required: [true, `La fonction est obligatoire`],
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
  company_name: {
    type: String,
    required: [true, `La compagnie est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ExperienceSchema