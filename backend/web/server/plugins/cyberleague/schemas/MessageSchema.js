const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const Schema = mongoose.Schema

const MessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'conversation',
      required: [true, `La conversation est obligatoire`],
    },
    content: {
      type: String,
      required: [true, 'Le message est obligatoire'],
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, "L'expéditeur est obligatoire"],
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Un destinataire est obligatoire'],
    },
    attachment: {
      type: String,
      required: false,
    },
    mine: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  schemaOptions
)

MessageSchema.virtual('display_date', DUMMY_REF).get(function () {
  return this.creation_date
})

module.exports = MessageSchema