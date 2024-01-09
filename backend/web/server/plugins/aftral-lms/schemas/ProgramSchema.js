const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR, PROGRAM_STATUS, PROGRAM_STATUS_DRAFT}=require('../consts')

const ProgramSchema = new Schema({
  status: {
    type: String,
    enum: Object.keys(PROGRAM_STATUS),
    default: PROGRAM_STATUS_DRAFT,
    required: [true, `Le status est obligatoire`],
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = ProgramSchema
