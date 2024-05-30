const mongoose = require('mongoose')
const { isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')
const { SOFT_SKILLS } = require('../consts')

const Schema = mongoose.Schema

const SoftSkillSchema = new Schema({
  name: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le libellé est obligatoire'],
  },
  value: {
    type: String,
    enum: Object.keys(SOFT_SKILLS),
    required: [true, 'Le code est obligatoire'],
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = SoftSkillSchema
