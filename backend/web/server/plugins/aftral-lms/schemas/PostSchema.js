const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { FEED_TYPE } = require('../consts')
const { DUMMY_REF } = require('../../../utils/database')
const Schema = mongoose.Schema

const PostSchema = new Schema({
  contents: {
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
  author: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, "L'auteur est obligatoire"],
  },
  _feed: {
    type: String,
    required: true,
    refPath: '_feed_type'
  },
  _feed_type: {
    type: String,
    required: true,
    enum: Object.keys(FEED_TYPE),
  },
  _liked_by: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  liked: {
    type: Boolean,
    required: true,
    default: false,
  },
}, schemaOptions)

PostSchema.virtual('likes_count', DUMMY_REF).get(function(){
  return this._liked_by.length || 0
})

PostSchema.virtual('comments', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'post',
})

PostSchema.virtual('comments_count', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
})

module.exports = PostSchema
