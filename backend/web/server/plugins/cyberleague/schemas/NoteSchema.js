const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { NOTE_TYPES } = require('../consts')
const Schema = mongoose.Schema

let NoteSchema = new Schema({
  type: {
    type: String,
    enum: Object.keys(NOTE_TYPES),
    required: [true, `Le type de la note est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = NoteSchema