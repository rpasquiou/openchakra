const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CommunicationSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'utilisateur est obligatoire`],
  },
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
  },
  description: {
    type: String,
    required: false,
  },
  date: {
    type: String,
    required: [true, `La date est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CommunicationSchema