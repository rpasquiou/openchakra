const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { LIVEFEED_MAX_LENGTH } = require('../consts')

const Schema = mongoose.Schema

const AdminDashboardSchema = new Schema({
  current_campaign: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false
  },
  livefeed: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'note',
      required: true
    }],
    default: [],
    validate: [(v) => {v?.length < LIVEFEED_MAX_LENGTH},`Le livefeed doit être au maximum de taille ${LIVEFEED_MAX_LENGTH}`],
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

// AdminDashboardSchema.virtual('current_advertising', DUMMY_REF).get(function () {
//   return this.current_campaign.current_advertising
// })

/* eslint-enable prefer-arrow-callback */

module.exports = AdminDashboardSchema