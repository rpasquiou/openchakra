const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { PERMISSIONS } = require('../consts')

const Schema = mongoose.Schema

const PermissionSchema = new Schema({
  value: {
    type: String,
    enum: Object.keys(PERMISSIONS),
    required: true,
  },
  label: {
    type: String,
    required: true,
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = PermissionSchema