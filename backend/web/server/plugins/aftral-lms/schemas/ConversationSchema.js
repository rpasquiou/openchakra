const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const ConversationSchema = new Schema({
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  newest_message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'message',
  },
},schemaOptions)

ConversationSchema.virtual('messages', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
})

module.exports=ConversationSchema
