const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ExpertiseSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'expertiseCategory',
    required: [true, 'Une expertise doit avoir une catégorie']
  },
  picture: {
    type: String,
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseSchema