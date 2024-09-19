const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { EVENT_VISIBILITY, EVENT_VISIBILITY_PUBLIC } = require('../consts')

const Schema = mongoose.Schema

const EventSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
  },
  start_date: {
    type: Date,
    required: [true, 'La date de début est obligatoire'],
  },
  end_date: {
    type: Date,
    required: [true, 'La date de fin est obligatoire'],
  },
  picture: {
    type: String,
    required: false,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: [true, 'La compagnie est obligatoire'],
  },
  is_webinaire: {
    type: Boolean,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  replay_url: {
    type: String,
    required: false
  },
  expertise_set: {
    type: Schema.Types.ObjectId,
    ref: 'expertiseSet',
  },
  visibility: {
    type: String,
    enum: Object.keys(EVENT_VISIBILITY),
    required: true,
    default: EVENT_VISIBILITY_PUBLIC,
  },
  price: {
    type: String,
    required: false
  },
  media_one: {
    type: String,
    required: false,
  },
  media_two: {
    type: String,
    required: false,
  },
  media_three: {
    type: String,
    required: false,
  },
  related_events: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'event'
    }]
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

EventSchema.virtual('registered_users', {
  ref:'user',
  localField:'_id',
  foreignField:'registered_events',
})

EventSchema.virtual('registered_users_count', {
  ref:'user',
  localField:'_id',
  foreignField:'registered_events',
  count:true,
})

/* eslint-enable prefer-arrow-callback */

module.exports = EventSchema
