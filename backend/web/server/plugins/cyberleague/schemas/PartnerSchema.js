const mongoose = require('mongoose')
const {DISCRIMINATOR_KEY} = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const PartnerSchema = new Schema({

},{...schemaOptions},{...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = PartnerSchema