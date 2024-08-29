const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ResourceSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom de la ressource est obligatoire`]
  },
  duration: {
    type: Number,
    required: false,
  },
  url: {
    type: String,
    required: [true, `Le lien vers le fichier est obligatoire`]
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ResourceSchema
