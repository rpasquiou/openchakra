const mongoose = require('mongoose')
const { isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const ExpertiseSchema = new Schema({
  name: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le libellé est obligatoire'],
  },
  job_file: {
    type: Schema.Types.ObjectId,
    ref: 'jobFile',
    required: [true, `La fiche métier est obligatoire`],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'expertiseCategory',
    required: [true, `La catégorie est obligatoire`],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseSchema
