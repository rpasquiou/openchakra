const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const {schemaOptions} = require('../../../utils/schemas')
const { CATEGORIES } = require('../consts')

const Schema = mongoose.Schema

const ExpertiseSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  category: {
    type: String,
    enum: Object.keys(CATEGORIES)
  },
  picture: {
    type: String,
    required: false,
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseSchema
