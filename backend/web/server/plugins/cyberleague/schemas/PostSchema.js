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
  group: {
    type: Schema.Types.ObjectId,
    ref: 'group',
    required: false,
  },
  _liked_by: {
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
  }
}, {...schemaOptions})

PostSchema.virtual('comments_count', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
})

PostSchema.virtual('comments', {
  ref: "comment", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "post", // is equal to foreignField
});

PostSchema.virtual('likes_count', DUMMY_REF).get(function () {
  return this._liked_by?.length || 0
})

module.exports = PostSchema
