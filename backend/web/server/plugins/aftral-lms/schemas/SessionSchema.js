const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const SessionSchema = new Schema({
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`],
  },
  end_date: {
    type: Date,
    required: [true, `La date de fin est obligatoire`],
  },
  location: {
    type: String,
    required: false,
  },
  trainers: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    index: true,
    required: true,
    default: [],
  },
  trainees: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    index: true,
    required: true,
    default: [],
  },
  // HACK Computed if I am the one
  filtered_trainee: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  // AFTRAL session id
  aftral_id: {
    type: String,
    required: false,
  },
  conversations: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'sessionConversation',
    }],
    required: true,
    default: [],
  },
  can_post_feed: {
    type: Boolean,
    required: true,
    default: false,
  },
  visible_feed: {
    type: Boolean,
    required: true,
    default: false,
  },
  _trainees_connections: [{
    trainee: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    }
  }],
  visios: [{
    type: Schema.Types.ObjectId,
    ref: 'visioDay',
  }],
  complementary: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'resource',
      required: true,
    }],
    default: [],
    required: true,
  }
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

/* eslint-disable prefer-arrow-callback */
SessionSchema.virtual('display_name', DUMMY_REF).get(function() {
  return `${this.code} (${this.session_product_code||''})`
})
/* eslint-enable prefer-arrow-callback */

module.exports = SessionSchema
