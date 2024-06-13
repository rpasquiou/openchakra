const mongoose = require('mongoose')
const { isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const SectorSchema = new Schema({
  name: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le secteur est obligatoire'],
  },
  picture: {
    type: String,
    required: false,
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = SectorSchema
