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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false,
  }],
}, schemaOptions)

PostSchema.virtual('liked').get(function() {
  return false
})

module.exports = PostSchema
