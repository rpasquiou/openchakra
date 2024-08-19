const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const SchoolSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  logo: {
    type: String,
    required: false,
  },
}, {...schemaOptions})

module.exports = SchoolSchema