const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, PROGRAM_STATUS, PROGRAM_STATUS_DRAFT}=require('../consts')

const ProductCodeSchema = new Schema({
  code: {
    type: String,
    required: [true, `Le code est obligatoire`],
  }
}, {...schemaOptions})

module.exports = ProductCodeSchema
