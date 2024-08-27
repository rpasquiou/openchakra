const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const HelpDeskConversationSchema = new Schema({
  user: { //trainee, trainer, conceptor
    type: Schema.Types.ObjectId,
    ref: `user`,
  },
  ticket: {
    type: Schema.Types.ObjectId,
    ref: `ticket`,
  },
  block: {
    type: Schema.Types.ObjectId,
    ref: `block`,
    required: false,
  },
},
schemaOptions)

module.exports=HelpDeskConversationSchema
