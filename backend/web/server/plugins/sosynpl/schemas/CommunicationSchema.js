const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CommunicationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'customerFreelance',
    required: [true, `Le freelance est obligatoire`],
  },
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
  },
  description: {
    type: String,
    required: [true, `La description est obligatoire`],
  },
  date: {
    type: String,
    required: [true, `La date est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CommunicationSchema