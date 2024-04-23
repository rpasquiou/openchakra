const mongoose = require('mongoose')
const moment = require('moment')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { GENDER } = require('../consts')

const Schema = mongoose.Schema

const NutritionAdviceSchema = new Schema({
  start_date: {
    type: Date,
    default: () => moment(),
    required: [true, 'La date de début est obligatoire']
  },
  duration: {
    type: Number,
    default: 15,
    required: [true, 'La durée est obligatoire']
  },
  comment: {
    type: String,
    required: true,
  },
  food_document: {
    type: Schema.Types.ObjectId,
    ref: 'foodDocument',
    required: false,
  },
  diet: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `La diet est obligatoire`],
  },
  patient_email: {
    type: String,
    required: [true, `L'email du patient est obligatoire`],
  },
  gender: {
    type: String,
    enum: Object.keys(GENDER),
    set: v => v || undefined,
    required: false,
  },
  age: {
    type: Number,
    min: [18, `L'âge doit être supérieur à 18 ans`],
    max: [130, `L'âge doit être inférieur à 130 ans`],
    required: false,
  },
  job: {
    type: String,
    required: false,
  },
  reason: {
    type: String,
    required: false,
  },
  // Did the patient start a coahcing after this CN ?
  led_to_coaching: {
    type: Boolean,
    required: false,
  },
  migration_id: {
    type: Number,
    index: true,
    required: false,
  },
},
{...schemaOptions}
)

/* eslint-disable prefer-arrow-callback */
NutritionAdviceSchema.virtual('end_date', DUMMY_REF).get(function() {
  const end=moment(this.start_date).add(this.duration, 'minutes')
  return end.isValid() ? end : null
})
/* eslint-enable prefer-arrow-callback */

module.exports = NutritionAdviceSchema
