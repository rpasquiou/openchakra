const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const lodash=require('lodash')
const {COMPANY_ACTIVITY, COMPANY_SIZE}=require('../consts')

const Schema = mongoose.Schema

const CommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, "L'utilisateur est obligatoire"],
    },
    text: {
      type: String,
      required: [true, 'Le commentaire est obligatoire'],
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'post',
      required: [true, `Le post est obligatoire`]
    },
  },
  schemaOptions,
)

module.exports = CommentSchema
