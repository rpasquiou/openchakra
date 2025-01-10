const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { NUTRISCORE, NOTE_TYPES, SECTOR } = require('../consts')
const Schema = mongoose.Schema

let NoteSchema = new Schema({
  type: {
    type: String,
    enum: Object.keys(NOTE_TYPES),
    required: [true, `Le type de la note est obligatoire`]
  },
  sector: {
    type: String,
    enum: Object.keys(SECTOR),
    required: [true,`Le secteur de l'utilisateur à l'origine de la note est obligatoire`],
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, `la date de la note est obligatoire`],
  },
  nutriscore: {
    type: String,
    enum: Object.keys(NUTRISCORE),
    validate: [function(value) {!(value && this.global_rate)}, `Une note ne peut pas avoir un score et un nutriscore`],
    required: [function () {!this.global_rate}, `Une note doit avoir soit un score, soit un nutriscore`],
  },
  global_rate: {
    type: Number,
    validate: [function(value) {!(value && this.nutriscore)}, `Une note ne peut pas avoir un score et un nutriscore`],
    required: [function () {!this.nutriscore}, `Une note doit avoir soit un score, soit un nutriscore`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = NoteSchema