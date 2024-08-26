const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const Schema = mongoose.Schema
const GroupSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`]
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le formateur est obligatoire`],
  },
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: 'session',
    required: [true, `La/Les sessions sont obligatoires`]
  }],
  picture: {
    type: String,
    required: false,
  },
  feed: {
    type: Schema.Types.ObjectId,
    ref: 'feed',
    required: false,
  },
  can_post: {
    type: Boolean,
    required: true,
    default: true,
  },
  trainees: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: []
  }
},
  schemaOptions)

module.exports = GroupSchema