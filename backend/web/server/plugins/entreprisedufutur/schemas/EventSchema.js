const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { EVENT_VISIBILITY, EVENT_VISIBILITY_PUBLIC, BOOLEAN_ENUM, EVENT_AVAILABILITIES, TIMEZONES, TIMEZONE_PLUS_1, EVENT_STATUS_FUTUR, EVENT_STATUS_PAST, EVENT_TARGETS } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const { isEmailOk, isPhoneOk } = require('../../../../utils/sms')
const AddressSchema = require('../../../models/AddressSchema')
const moment=require('moment')

const Schema = mongoose.Schema

const EventSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur de l'événement est obligatoire`]
  },
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`],
  },
  description: {
    type: String,
    required: [true, `La description est obligatoire`],
  },
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`],
  },
  end_date: {
    type: Date,
    required: [true, `La date de fin est obligatoire`],
  },
  picture: {
    type: String,
    required: [true, `La picture est obligatoire`],
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
    //computed
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  registered_users_count: {
    //computed
    type: Number,
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
    //computed
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  waiting_list_count: {
    //computed
    type: Number,
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
  is_free : {
    type: Boolean,
    default: false,
    required: false
  },
  target: {
    type: [{
      type: String,
      ref: 'target',
      required: true
    }],
    required: false,
    default: [],
  },
  category: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'eventCategory',
      required: true
    }],
    required: false,
    default: []
  },
  partners: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'company',
      required: true
    }],
    required: false,
    default: []
  },
  available_tickets: {
    //computed
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'eventTicket',
      required: true
    }],
    default: [],
  },
  booked_tickets: {
    //computed
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'eventTicket',
      required: true
    }],
    default: [],
  },
  waiting_tickets: {
    //computed
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'eventTicket',
      required: true
    }],
    default: [],
  },
  is_registered: {
    //computed
    type: Boolean,
    required: false,
  },
  allergies: {
    //computed
    type: [{
      type: String,
      required: true,
    }],
    default: []
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

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

EventSchema.virtual('status', DUMMY_REF).get(function() {
  return moment().isBefore(this.start_date) ? EVENT_STATUS_FUTUR : EVENT_STATUS_PAST
})

EventSchema.virtual('attachments', {
  ref: 'attachment',
  localField: '_id',
  foreignField: 'event'
})

EventSchema.virtual('price_range', DUMMY_REF).get(function () {
  if (!this.event_tickets?.length) {
    return null
  }

  const prices = this.event_tickets
    .map((ticket) => ticket.price)
    .filter((price) => price != null)

  if (!prices.length) {
    return null
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  if (minPrice === maxPrice) {
    return `${minPrice}€`
  }

  return `${minPrice}€ - ${maxPrice}€`
})

/* eslint-enable prefer-arrow-callback */

module.exports = EventSchema