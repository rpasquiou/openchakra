const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const Schema = mongoose.Schema

const CertificationSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom du template est obligatoire`],
  },
  template: { //link to template
    type: String,
    required: [true, `Le fichier est obligatoire`]
  }
}, { ...schemaOptions })

module.exports = CertificationSchema
