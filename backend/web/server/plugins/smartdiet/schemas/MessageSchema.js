const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
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
    required:[function(){return !this?.receiver && !this?.group}, 'Un destinataire ou groupe est obligatoire'],
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'group',
    required:[function(){return !this?.receiver && !this?.group}, 'Un destinataire ou groupe est obligatoire'],
  },
  attachment: {
    type: String,
    required: false,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  pins: [{
    type: Schema.Types.ObjectId,
    ref: 'user',
  }],
  liked: {
    type: Boolean
  },
  pinned: {
    type: Boolean
  },
  migration_id: {
    type: Number,
    index: true,
    required: false,
  },
}, schemaOptions)

module.exports = MessageSchema
