const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const DocumentSchema = new Schema({
  title: {
    type: String,
    required: [true, `le titre est obligatoire`]
  },
  media: {
    type: String,
    required: [true, `le média est obligatoire`]
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = DocumentSchema