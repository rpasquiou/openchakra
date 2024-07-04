const mongoose = require('mongoose')
const lodash = require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const { CONTENTS_TYPE } = require('../../smartdiet/consts')

const Schema = mongoose.Schema

const ContentSchema = new Schema({
  type: {
    type: String, 
    enum: Object.keys(CONTENTS_TYPE),
    required: [true, `Le type de contenu est obligatoire`]
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le créateur est obligatoire'],
  },
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
  },
  external_media: {
    type: String,
    required: false,
  },
  internal_media: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  source: {
    type: String,
    required: false
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  }
}, schemaOptions)

module.exports = ContentSchema
