const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { CONTENT_TYPE, CONTENT_VISIBILITY, CONTENT_PUBLIC } = require('../consts')

const Schema = mongoose.Schema

const ContentSchema = new Schema({
  type: {
    type: String, 
    enum: Object.keys(CONTENT_TYPE),
    required: [true, `Le type de contenu est obligatoire`]
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le créateur est obligatoire'],
  },
  short_description: {
    type: String,
    required: false,
  },
  duration: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
  },
  external_media: {
    type: String,
    required: false,
  },
  internal_media: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  source: { // Example: Le Monde
    type: String,
    required: false
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
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
  },
  visibility: {
    type: String,
    enum: Object.keys(CONTENT_VISIBILITY),
    default: CONTENT_PUBLIC,
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
  related_content: [{
    type: Schema.Types.ObjectId,
    ref: 'content',
    required: false,
  }],
  expertise_set: {
    type: Schema.Types.ObjectId,
    ref: 'expertiseSet',
  },
  suggested_content: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'content',
      required: true
    }],
    default: []
  }
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */

ContentSchema.virtual('comments_count', {
  ref: 'comment',
  localField: '_id',
  foreignField: 'content',
  count: true,
})

ContentSchema.virtual('comments', {
  ref: "comment", // The Model to use
  localField: "_id", // Find in Model, where localField
  foreignField: "content", // is equal to foreignField
});

ContentSchema.virtual('likes_count', DUMMY_REF).get(function () {
  return this._liked_by?.length || 0
})

/* eslint-enable prefer-arrow-callback */

module.exports = ContentSchema
