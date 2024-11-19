const mongoose=require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const VisioProgressSchema = new Schema({
  visio: {
    type: Schema.Types.ObjectId,
    ref: 'visio',
    required: [true, `La visio est obligatoire`]
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le compte est obligatoire`]
  },
  // Duration in seconds
  spent_time: {
    type: Number,
    required: false,
  },

}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = VisioProgressSchema