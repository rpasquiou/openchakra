const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const AdminDashboardSchema = new Schema({
  current_campaign: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

// AdminDashboardSchema.virtual('current_advertising', DUMMY_REF).get(function () {
//   return this.current_campaign.current_advertising
// })

/* eslint-enable prefer-arrow-callback */

module.exports = AdminDashboardSchema