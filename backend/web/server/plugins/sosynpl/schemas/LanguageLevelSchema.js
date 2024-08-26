const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { LANGUAGE_LEVEL } = require('../../../../utils/consts')
const { SOSYNPL_LANGUAGES } = require('../consts')

const Schema = mongoose.Schema

const LanguageLevelSchema = new Schema({
  language: {
    type: String,
    enum: Object.keys(SOSYNPL_LANGUAGES),
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
