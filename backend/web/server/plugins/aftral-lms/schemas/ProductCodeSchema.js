const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, PROGRAM_STATUS, PROGRAM_STATUS_DRAFT}=require('../consts')

const ProductCodeSchema = new Schema({
  code: {
    type: String,
    set : v => v ? v.toUpperCase() : v,
    required: [true, `Le code est obligatoire`],
    index: true,
  }
}, {...schemaOptions})

module.exports = ProductCodeSchema
