const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const AdminDashboardSchema = new Schema({
  current_campaign: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = AdminDashboardSchema