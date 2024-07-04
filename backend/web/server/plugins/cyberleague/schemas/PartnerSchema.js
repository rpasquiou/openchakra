const mongoose = require('mongoose')
const {ROLE_DISCRIMINATOR, DISCRIMINATOR_KEY} = require('../consts')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const UserSchema = require('./UserSchema')

const Schema = mongoose.Schema

const PartnerSchema = new Schema({

},{...schemaOptions},{...DISCRIMINATOR_KEY})

module.exports = PartnerSchema
