const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const DidYouKnowSchema = new Schema({
  body: {
    type: String,
    required: [true, 'Le contenu est obligatoire'],
  },
  number: {
    type: String,
    required: false
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = DidYouKnowSchema