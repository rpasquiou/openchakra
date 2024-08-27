const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { PERMISSIONS } = require('../consts')

const Schema = mongoose.Schema

const PermissionGroupSchema = new Schema({
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'permission',
  }],
  label: {
    type: String,
    required: false,
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = PermissionGroupSchema