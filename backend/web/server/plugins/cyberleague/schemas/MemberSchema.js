const mongoose = require('mongoose')
const lodash=require('lodash')
const {schemaOptions} = require('../../../utils/schemas')
const { DISCRIMINATOR_KEY } = require('../consts')
const Schema = mongoose.Schema

let MemberSchema = new Schema({
    isStudent : {
        type: Boolean,
        default: false,
    }
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = MemberSchema
