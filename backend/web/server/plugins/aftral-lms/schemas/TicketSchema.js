const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { TICKET_STATUS, TICKET_STATUS_NOT_TREATED, TICKET_TAG } = require('../consts')

const Schema = mongoose.Schema

const TicketSchema = new Schema({
  title: {
    type: String,
    required: [true, `Le titre est obligatoire`],
  },
  content: {
    type: String,
    required: [true, `Le contenu est obligatoire`],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'utilisateur est obligatoire`],
  },
  documents: [{
    type: String,
    required: false
  }],
  block: {
    type: Schema.Types.ObjectId,
    ref: 'block',
    required: false,
  },
  status: {
    type: String,
    enum: Object.keys(TICKET_STATUS),
    required: [true, `Le status est obligatoire`],
    default: TICKET_STATUS_NOT_TREATED,
  },
  tag: {
    type: String,
    enum: Object.keys(TICKET_TAG),
    required: false,
  }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = TicketSchema