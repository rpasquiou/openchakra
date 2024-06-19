const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const BadgeSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  picture: {
    type: String,
    required: [true, `L'illustration' est obligatoire`],
  },
}, schemaOptions)

module.exports = BadgeSchema
