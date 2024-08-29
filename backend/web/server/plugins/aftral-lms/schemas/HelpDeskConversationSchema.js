const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const HelpDeskConversationSchema = new Schema({
  user: { //trainee, trainer, conceptor
    type: Schema.Types.ObjectId,
    ref: `user`,
    required: [true, `L'utilisateur est obligatoire`]
  },
  ticket: {
    type: Schema.Types.ObjectId,
    ref: `ticket`,
    required: [true, `Le ticket est obligatoire`]
  },
  block: {
    type: Schema.Types.ObjectId,
    ref: `block`,
    required: false,
  },
},
schemaOptions)

module.exports=HelpDeskConversationSchema
