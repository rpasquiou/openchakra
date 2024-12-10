const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const AttachmentSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom de la pièce jointe est obligatoire`]
  },
  media: {
    type: String,
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = AttachmentSchema