const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
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
  reactions: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false
  }],
}, schemaOptions)

module.exports = PostSchema
