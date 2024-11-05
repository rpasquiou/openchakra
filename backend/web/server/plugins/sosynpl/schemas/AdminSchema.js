const mongoose = require('mongoose')
const {isPhoneOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const IBANValidator = require('iban-validator-js')
const { NATIONALITIES, DISCRIMINATOR_KEY, ROLES, ROLE_CUSTOMER } = require('../consts')
const siret = require('siret')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const AdminSchema = new Schema({
    default: {
        type: Boolean,
        default: false
    }
}, {...schemaOptions, ...DISCRIMINATOR_KEY})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

AdminSchema.virtual('managed_accounts', {
    ref: 'customerFreelance',
    localField: '_id',
    foreignField: 'dedicated_admin',
})

module.exports = AdminSchema
