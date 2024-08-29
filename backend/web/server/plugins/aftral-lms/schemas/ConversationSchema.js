const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const ConversationSchema = new Schema({
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
},schemaOptions)

ConversationSchema.virtual('messages', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
})

ConversationSchema.virtual('messages_count', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
  count:true,
})

ConversationSchema.virtual('newest_message', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
  options: { 
    sort: { creation_date: -1 }, limit:1
  },
  justOne: true,
})

module.exports=ConversationSchema
