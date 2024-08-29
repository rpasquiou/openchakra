const mongoose = require('mongoose')
const {DISCRIMINATOR_KEY} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const PartnerSchema = new Schema({

},{...schemaOptions},{...DISCRIMINATOR_KEY})

module.exports = PartnerSchema