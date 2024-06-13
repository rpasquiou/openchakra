const mongoose = require('mongoose')
const { isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const JobFileSchema = new Schema({
  code: {
    type: String,
    required: [true, 'Le code métier est obligatoire'],
  },
  name: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le nom de la fiche métier est obligatoire'],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
JobFileSchema.virtual('jobs', {
  ref: 'job',
  localField: 'code',
  foreignField: 'code',
})

JobFileSchema.virtual('features', {
  ref: 'jobFileFeature',
  localField: '_id',
  foreignField: 'job_file',
})

JobFileSchema.virtual('hard_skills', {
  ref: 'hardSkill',
  localField: '_id',
  foreignField: 'job_file',
})
/* eslint-enable prefer-arrow-callback */

module.exports = JobFileSchema
