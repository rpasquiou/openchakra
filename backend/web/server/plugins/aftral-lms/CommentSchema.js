const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CommentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, "L'utilisateur est obligatoire"],
  },
  content: {
    type: String,
    required: [true, 'Le commentaire est obligatoire'],
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'post',
    required: [true, `Le post est obligatoire`]
  },
}, schemaOptions,)

module.exports = CommentSchema
