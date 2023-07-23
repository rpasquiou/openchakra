const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
  },
  schemaOptions,
)

module.exports = UserSchema
