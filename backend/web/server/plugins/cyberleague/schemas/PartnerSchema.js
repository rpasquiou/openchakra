const mongoose = require('mongoose')
const {DISCRIMINATOR_KEY} = require('../consts')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const UserSchema = require('./UserSchema')
const { idEqual, DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const PartnerSchema = new Schema({

},{...schemaOptions},{...DISCRIMINATOR_KEY})

UserSchema.virtual('is_company_admin', DUMMY_REF).get(function() {
  return lodash.some(this.company?.administrators, id => idEqual(id,this._id))
})

module.exports = PartnerSchema