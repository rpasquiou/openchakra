const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const HistorySchema = new Schema({
  source: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'lead',
    // refPath: 'docModel'
  },
  // docModel: {
  //   type: String,
  //   required: true,
  //   enum: ['lead']
  // },
  attribute: {
    type: String,
  },
  value: {
    type: String,
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = HistorySchema
