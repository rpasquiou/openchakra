const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { EVALUATION_MIN, EVALUATION_MAX } = require('../consts')
const lodash=require('lodash')

const Schema = mongoose.Schema

const EvaluationSchema = new Schema({
  creation_date: {
    type: Date,
    required: [true, 'la date de création est obligatoire'],
  },
  user: {
    type: Schema.Types.ObjectId,
    required: [true, `l'utilisateur est obligatoire`],
    ref: 'user',
  },
  mission: {
    type: Schema.Types.ObjectId,
    required: [true, `la mission est obligatoire`],
    ref: 'mission',
  },
  comment: {
    type: String,
    required: false,
  },
  customer_note_quality: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  customer_note_deadline: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  customer_note_team: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  customer_note_reporting: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  freelance_note_interest: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  freelance_note_organisation: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  freelance_note_integration: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  freelance_note_communication: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
}, { ...schemaOptions })

EvaluationSchema.virtual('customer_average_note').get(function(){
  const NOTES = [
    this.customer_note_deadline, 
    this.customer_note_quality, 
    this.customer_note_reporting, 
    this.customer_note_team
  ]
  const validNotes = lodash.filter(NOTES, note => !lodash.isNil(note))
  return lodash.mean(validNotes)
})

EvaluationSchema.virtual('freelance_average_note').get(function(){
  const NOTES = [
    this.freelance_note_communication,
    this.freelance_note_integration,
    this.freelance_note_interest,
    this.freelance_note_organisation
  ]
  const validNotes = lodash.filter(NOTES, note => !lodash.isNil(note))
  return lodash.mean(validNotes)
})

module.exports = EvaluationSchema