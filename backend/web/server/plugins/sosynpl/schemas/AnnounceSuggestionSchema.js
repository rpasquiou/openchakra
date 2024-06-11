const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { ANNOUNCE_SUGGESTION, ANNOUNCE_SUGGESTION_SENT, ANNOUNCE_SUGGESTION_ACCEPTED, ANNOUNCE_SUGGESTION_REFUSED, REFUSE_REASON} = require('../consts')
const Schema = mongoose.Schema


const AnnounceSuggestionSchema = new Schema({
  announce: {
    type: Schema.Types.ObjectId,
    ref: 'announce',
    required: [true, `L'annonce est obligatoire`],
  },
  freelance: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le freelance est obligatoire`],
  },
  status: {
    type: String,
    enum: Object.keys(ANNOUNCE_SUGGESTION),
    default: ANNOUNCE_SUGGESTION_SENT,
    required: [true, `Le statut est obligatoire`],
  },
  acceptation_date: {
    type: Date,
    required: [function() {return this.status==ANNOUNCE_SUGGESTION_ACCEPTED}, `La date d'acceptation est obligatoire`]
  },
  refuse_date: {
    type: Date,
    required: [function() {return this.status==ANNOUNCE_SUGGESTION_REFUSED}, `La date de refus est obligatoire`]
  },
  refuse_reason: {
    type: String,
    enum: Object.keys(REFUSE_REASON),
    trequired: [function() {return this.status==ANNOUNCE_SUGGESTION_REFUSED}, `La raison de refus est obligatoire`]
  }
}, schemaOptions)


module.exports = AnnounceSuggestionSchema
