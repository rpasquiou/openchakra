const {COMMISSION_SOURCE} = require('../../utils/consts')
const mongoose = require('mongoose')
const Schema=mongoose.Schema

const mongooseLeanVirtuals = require('mongoose-lean-virtuals')

const CommissionSchema = new Schema({
  // Commission rate
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 1.0,
  },
  // Commission fixed fee
  fixed: {
    type: Number,
    required: false,
    min: 0,
  },
  // Destinee company
  target: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: true,
  },
  // Taken from provider or customer ?
  source: {
    type: String,
    enum: Object.keys(COMMISSION_SOURCE),
    required: true,
  },
})

CommissionSchema.plugin(mongooseLeanVirtuals)

module.exports = mongoose.model('commission', CommissionSchema)
