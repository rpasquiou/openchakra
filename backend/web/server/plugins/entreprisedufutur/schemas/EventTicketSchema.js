const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const EventTicketSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom du ticket est obligatoire`]
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: [true, `L'événement est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = EventTicketSchema