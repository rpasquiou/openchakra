const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')

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
    required: true,
    default: [],
  },
  trainees: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: [],
  },
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
  proof: {
    type: String,
    required: false,
  },
  certificate: {
    type: String,
    required: false,
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

module.exports = SessionSchema
