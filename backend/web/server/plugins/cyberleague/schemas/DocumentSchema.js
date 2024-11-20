const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { DOCUMENT_TYPE_PRIVATE, DOCUMENT_TYPE_PUBLIC } = require('../consts')

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

DocumentSchema.virtual('type', DUMMY_REF).get(function() {
  return this.company ? DOCUMENT_TYPE_PRIVATE : DOCUMENT_TYPE_PUBLIC
})

/* eslint-enable prefer-arrow-callback */

module.exports = DocumentSchema