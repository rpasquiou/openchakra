const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { CONTENT_TYPE } = require('../consts')

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
  expertises: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'expertise',
      required: false,
      index: true,
    }],
    default: []
  },
}, schemaOptions)

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

module.exports = ContentSchema
