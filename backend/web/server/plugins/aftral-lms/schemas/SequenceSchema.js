const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')

const SequenceSchema = new Schema({
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = SequenceSchema
