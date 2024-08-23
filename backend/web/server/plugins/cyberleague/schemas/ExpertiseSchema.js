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

module.exports = ExpertiseSchema
