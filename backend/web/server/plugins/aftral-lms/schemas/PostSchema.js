const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
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
    enum: ['session', 'group']
  },
}, schemaOptions)

module.exports = PostSchema
