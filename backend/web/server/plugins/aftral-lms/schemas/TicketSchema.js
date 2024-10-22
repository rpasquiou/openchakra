const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const {schemaOptions} = require('../../../utils/schemas')
const { TICKET_STATUS, TICKET_STATUS_NOT_TREATED, TICKET_TAG } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

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
  },
  notes: {
    type: String,
    required: false,
  },
  conversation: [{
    type: Schema.Types.ObjectId,
    ref: `conversation`,
  }],
  _number: {
    type: Number,
  },
}, {...schemaOptions})

// Ensure autoincrement is initalized
if (mongoose.connection) {
  autoIncrement.initialize(mongoose.connection)
}

TicketSchema.plugin(autoIncrement.plugin, { model: 'ticket', field: '_number', startAt: 1});

TicketSchema.virtual('number', DUMMY_REF).get(function() {
  return this._number?.toString().padStart(6, '0') || ''
})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = TicketSchema