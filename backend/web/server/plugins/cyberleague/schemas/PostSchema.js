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
    required: [true, "L'auteur est obligatoire"],
  },
  picture: {
    type: String,
    required: false,
  },
  _likes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  }],
  liked: {
    type: Boolean,
    required: true,
    default: false,
  }
}, schemaOptions)

PostSchema.virtual('comments_count', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
})

PostSchema.virtual('likes_count', DUMMY_REF).get(function () {
  return this._likes?.length || 0
})

module.exports = PostSchema
