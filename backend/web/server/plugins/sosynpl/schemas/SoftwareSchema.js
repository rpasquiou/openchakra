const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const {SPOON_SOURCE} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const SoftwareSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le compte est obligatoire'],
  },
}, schemaOptions)

module.exports = SoftwareSchema
