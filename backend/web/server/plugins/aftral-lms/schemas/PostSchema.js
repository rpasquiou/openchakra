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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  liked: {
    type: Boolean,
    required: true,
    default: false,
  },
  comments:  [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'comment'
  }],
}, schemaOptions)

PostSchema.virtual('likes_count', DUMMY_REF).get(function(){
  return this.likes.length || 0
})

PostSchema.virtual('comments_count', DUMMY_REF).get(function(){
  return this.comments.length || 0
})

module.exports = PostSchema
