const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const AttachmentSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom de la pièce jointe est obligatoire`]
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: [true, `L'événement de la pièce jointe est obligatoire`]
  },
  media: {
    type: String,
    required: [true, `La pièce jointe est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = AttachmentSchema