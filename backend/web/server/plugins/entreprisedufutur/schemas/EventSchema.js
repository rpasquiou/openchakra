const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { EVENT_VISIBILITY, EVENT_VISIBILITY_PUBLIC, BOOLEAN_ENUM, EVENT_AVAILABILITIES, TIMEZONES, TIMEZONE_PLUS_1 } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const { isEmailOk, isPhoneOk } = require('../../../../utils/sms')
const AddressSchema = require('../../../models/AddressSchema')

const Schema = mongoose.Schema

const EventSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur de l'événement est obligatoire`]
  },
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
    required: [true, 'La picture est obligatoire'],
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
      ref: 'event',
      required: true
    }],
    required: false,
    default: []
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
    required: [true, `Le nom de l'organisateur est obligatoire`],
  },
  organizer_email: {
    type: String,
    required: [true, `L'email de l'organisateur est obligatoire`],
    set: v => v? v.toLowerCase().trim() : v,
    index: true,
    validate: [isEmailOk, v => `L'email '${v.value}' est invalide`],
  },
  organizer_phone: {
    type: String,
    validate: [value => !value || isPhoneOk(value), `Le numéro de téléphone doit commencer par 0 ou +33`],
    set: v => v?.replace(/^0/, '+33'),
    required: [true, `Le numéro de téléphone de l'organisateur est obligatoire`],
  },
  banner: {
    type: String,
    required: false
  },
  location_name: {
    type: String,
    required: [true, `Le nom du lieu est obligatoire`],
  },
  location_address: {
    type: AddressSchema,
    required: [true, `L'adresse du lieu est obligatoire`],
  },
  speakers: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  waiting_list: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  evaluations: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'evaluation',
      required: true,
    }],
    default: []
  },
  accomodations: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'accomodation',
      required: true,
    }],
    default: []
  },
  tip: {
    type: String,
    required: false
  },
  dress_code: {
    type: String,
    required: false
  },
  short_description: {
    type: String,
    required: false
  },
  admin: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }],
    required: false,
    default: []
  },
  star_event: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: false
  },
  reservable_tickets: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: false
  },
  meal_included: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: false
  },
  tablemap_included: {
    type: String,
    enum: Object.keys(BOOLEAN_ENUM),
    required: false
  },
  availability: {
    type: String,
    enum: Object.keys(EVENT_AVAILABILITIES),
    required: false
  },
  timezone: {
    type: String,
    enum: Object.keys(TIMEZONES),
    required: false,
    default: TIMEZONE_PLUS_1
  },
  tablemap: {
    type: Schema.Types.ObjectId,
    ref: 'tablemap',
    required: false
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'eventCategory',
    required: false
  },
  attachments: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'attachment',
      required: true,
    }],
    required: false,
    default: []
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

EventSchema.virtual('registered_users_count', DUMMY_REF).get(function() {
  return this.registered_users?.length
})

EventSchema.virtual('event_tickets', {
  ref:'eventTicket',
  localField:'_id',
  foreignField:'event',
})

EventSchema.virtual('posts', {
  ref: 'post',
  localField: '_id',
  foreignField: 'event'
})

EventSchema.virtual('posts_count', {
  ref: 'post',
  localField: '_id',
  foreignField: 'event',
  count: true,
})

/* eslint-enable prefer-arrow-callback */

module.exports = EventSchema