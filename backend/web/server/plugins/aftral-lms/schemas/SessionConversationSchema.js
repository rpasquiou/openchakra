const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const SessionConversationSchema = new Schema({
  trainee: { //trainee, trainer, conceptor
    type: Schema.Types.ObjectId,
    ref: `user`,
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: `group`,
  },
},
schemaOptions)

module.exports=SessionConversationSchema
