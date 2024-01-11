const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE}=require('../consts')

const ResourceSchema = new Schema({
  shortName: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: [true, `l'url est obligatoire`]
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le créateur est obligatoire'],
  },
  evaluation: {
    type: Boolean,
    required: false,
  },
  optional: {
    type: Boolean,
    default: false,
    required: [true, `Le caractère optionnel est obligatoire`],
  },
  resource_type: {
    type: String,
    enum: Object.keys(RESOURCE_TYPE),
    required: [true, `Le type de ressource est obligatoire`],
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = ResourceSchema
