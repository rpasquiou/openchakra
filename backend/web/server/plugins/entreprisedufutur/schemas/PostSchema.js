const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const Schema = mongoose.Schema

const PostSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Le contenu est obligatoire'],
  },
  media: { // url S3
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `L'auteur est obligatoire`],
  },
  picture: {
    type: String,
    required: false,
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'group',
    required: false,
  },
  liked_by: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    default: []
  },
  liked: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    required: false,
  },
  mine: {
    type: Boolean,
    default: false,
    required: false,
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

PostSchema.virtual('comments_count', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
})

PostSchema.virtual('comments', {
  ref: 'comment', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'post', // is equal to foreignField
})

PostSchema.virtual('likes_count', DUMMY_REF).get(function () {
  return this.liked_by?.length || 0
})

/* eslint-enable prefer-arrow-callback */

module.exports = PostSchema