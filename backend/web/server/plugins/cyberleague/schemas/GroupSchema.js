const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas');
const { DUMMY_REF } = require('../../../utils/database');

const Schema = mongoose.Schema

const GroupSchema = new Schema({
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'administrateur est obligatoire`],
  },
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  picture: {
    type: String,
    required: [true, 'L\'illustration est obligatoire'],
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
  },
  users: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  pending_users: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  expertises: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'expertise',
      index: true,
      required: false,
    }],
    default: []
  }
}, {...schemaOptions})


GroupSchema.virtual('posts', {
  ref: "post", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "group" // is equal to foreignField
});

GroupSchema.virtual('posts_count', {
  ref: "post", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "group", // is equal to foreignField
  count: true,
});

/* eslint-disable prefer-arrow-callback */

GroupSchema.virtual('users_count', DUMMY_REF).get(function () {
  return this.users?.length||0
})

GroupSchema.virtual('pending_users_count', DUMMY_REF).get(function () {
  return this.pending_users?.length||0
})

/* eslint-enable prefer-arrow-callback */

module.exports = GroupSchema