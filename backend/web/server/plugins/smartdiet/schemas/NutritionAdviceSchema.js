const mongoose = require('mongoose')
const moment = require('moment')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { GENDER, SOURCE, SOURCE_APPLICATION } = require('../consts')
const { copyPDF } = require('../../../../utils/fillForm')
const { API_ROOT } = require('../../../../utils/consts')
const { NotFound } = require('@aws-sdk/client-s3')
const { formatDateTime } = require('../../../../utils/text')

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
    required: [true, `Le commentaire est obligatoire`],
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
  // Nutrition Advice Source
  source: {
    type: String,
    enum: Object.keys(SOURCE),
    required: true,
    default: SOURCE_APPLICATION,
  },
  _certificate: {
    type: String,
    required: false,
  },
  // Computed Lazily created and stoer under _certificate
  certificate: {
    type: String,
  }
},
{...schemaOptions}
)

/* eslint-disable prefer-arrow-callback */
NutritionAdviceSchema.virtual('_user', {
  ref: 'user',
  localField: 'patient_email',
  foreignField: 'email',
  justOne: true,
})


NutritionAdviceSchema.virtual('end_date', DUMMY_REF).get(function() {
  const end=moment(this.start_date).add(this.duration, 'minutes')
  return end.isValid() ? end : null
})

/* eslint-enable prefer-arrow-callback */

module.exports = NutritionAdviceSchema
