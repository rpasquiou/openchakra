const { schemaOptions } = require('../../../utils/schemas');
const mongoose = require('mongoose');
const { ROLES } = require('../consts');

const UserSchema=require('./UserSchema')
const ContactSchema=UserSchema

module.exports = ContactSchema