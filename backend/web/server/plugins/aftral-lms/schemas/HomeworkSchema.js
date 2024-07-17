const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, RESOURCE_TYPE, SCALE}=require('../consts')

const HomeworkSchema = new Schema({
  trainee: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true,  `L'apprenant est obligatoire`],
  },
  resource: {
    type: Schema.Types.ObjectId,
    ref: 'resource',
    required: [true,  `La ressource est obligatoire`],
  },
  document: {
    type: String,
    required: [true, `Le fichier est obligatoire`],
  },
  description: {
    type: String,
    required: false,
  },
  // Note or scale is set by the trainer
  note: {
    type: Number,
    required: false,
  },
  scale: {
    type: String,
    enum: Object.keys(SCALE),
    required: false,
  },
  // Correction par le formateur
  correction: {
    type: String,
    required: false,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = HomeworkSchema
