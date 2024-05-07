const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { LANGUAGES, LANGUAGE_LEVEL } = require('../../../../utils/consts')

const Schema = mongoose.Schema

const LanguageLevelSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le freelance est obligatoire`],
  },
  language: {
    type: String,
    enum: Object.keys(LANGUAGES),
    required: [true, `La langue est obligatoire`],
  },
  level: {
    type: String,
    enum: Object.keys(LANGUAGE_LEVEL),
    required: [true, `Le niveau est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = LanguageLevelSchema
