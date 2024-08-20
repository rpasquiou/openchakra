const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, `Le rédacteur est obligatoire`],
    },
    text: {
      type: String,
      required: [true, 'Le commentaire est obligatoire'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'post',
      required: [function () {return !this.content}, "Un poste ou un contenu est obligatoire"],
    },
    content: {
      type: Schema.Types.ObjectId,
      ref: 'content',
      required: [function () {return !this.post}, "Un poste ou un contenu est obligatoire"],
    }
  },
  schemaOptions,
)

module.exports = CommentSchema
