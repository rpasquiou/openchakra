const mongoose = require('mongoose')
const {ROLE_DISCRIMINATOR} = require('../consts')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const UserSchema = require('./UserSchema')

const Schema = mongoose.Schema

let MemberSchema = UserSchema
MemberSchema.isStudent = {
    type: Boolean,
    default: false,
}

module.exports = MemberSchema
