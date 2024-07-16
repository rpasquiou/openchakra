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
  customer: {
    type: Schema.Types.ObjectId,
    required: [true, `le client est obligatoire`],
    ref: 'customerFreelance',
  },
  freelance: {
    type: Schema.Types.ObjectId,
    required: [true, `le freelance est obligatoire`],
    ref: 'customerFreelance',
  },
  mission: {
    type: Schema.Types.ObjectId,
    required: [true, `la mission est obligatoire`],
    ref: 'mission',
  },
  freelance_comment: {
    type: String,
    required: false,
  },
  customer_comment: {
    type: String,
    required: false,
  },
  freelance_note_quality: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  freelance_note_deadline: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  freelance_note_team: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  freelance_note_reporting: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  customer_note_interest: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  customer_note_organisation: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  customer_note_integration: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
  customer_note_communication: {
    type: Number,
    required: false,
    min: [EVALUATION_MIN, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
    max: [EVALUATION_MAX, `la valeur minimum doit être comprise entre ${EVALUATION_MIN} et ${EVALUATION_MAX}`],
  },
}, { ...schemaOptions })

EvaluationSchema.virtual('freelance_average_note').get(function(){
  const NOTES = [
    this.freelance_note_deadline, 
    this.freelance_note_quality, 
    this.freelance_note_reporting, 
    this.freelance_note_team
  ]
  const validNotes = lodash.filter(NOTES, note => !lodash.isNil(note))
  return lodash.mean(validNotes)
})

EvaluationSchema.virtual('customer_average_note').get(function(){
  const NOTES = [
    this.customer_note_communication,
    this.customer_note_integration,
    this.customer_note_interest,
    this.customer_note_organisation
  ]
  const validNotes = lodash.filter(NOTES, note => !lodash.isNil(note))
  return lodash.mean(validNotes)
})

module.exports = EvaluationSchema