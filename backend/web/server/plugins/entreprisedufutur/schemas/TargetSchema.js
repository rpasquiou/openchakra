const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')


const Schema = mongoose.Schema

const TargetSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom de la cible est obligatoire`]
  },
}, schemaOptions  )

module.exports = TargetSchema