const mongoose = require('mongoose')
const { isEmailOk } = require('../../../../utils/sms')
const {schemaOptions} = require('../../../utils/schemas')
const bcrypt = require('bcryptjs')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

// TODO Remove this, must belong to SmartDiet only
const DummyPackSchema = new Schema({
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = DummyPackSchema