const mongoose = require('mongoose')
const {schemaOptions} = require('../utils/schemas')

const Schema = mongoose.Schema

const PageTagSchema = new Schema({
  tag: {
    type: String,
    set: v => v?.trim(),
    required: [true, `Le tag est obligatoire`],
  },
  url: {
    type: String,
    set: v => v?.trim(),
    required: [true, `L'URL est obligatoire`],
  }
}, {...schemaOptions})

PageTagSchema.plugin(require('mongoose-lean-virtuals'))

module.exports = mongoose.model('pageTag_', PageTagSchema)
