const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CategoryRateSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'questionCategory',
    required: [true, `La question est obligatoire`],
  },
  rate: {
    type: Number,
    required: [true, `La note est obligatoire`],
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CategoryRateSchema