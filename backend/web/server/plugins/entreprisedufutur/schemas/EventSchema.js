const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { EVENT_VISIBILITY, EVENT_VISIBILITY_PUBLIC } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

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
  },
  registered_users: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  organizer_name: {
    type: String,
    required: [true, 'Le nom de l\'organisateur est obligatoire'],
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

EventSchema.virtual('registered_users_count', DUMMY_REF).get(function() {
  return this.registered_users?.length
})

/* eslint-enable prefer-arrow-callback */

module.exports = EventSchema