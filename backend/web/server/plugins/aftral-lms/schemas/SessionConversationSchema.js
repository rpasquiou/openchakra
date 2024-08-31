const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema

const SessionConversationSchema = new Schema({
  trainee: { //trainee, trainer, conceptor
    type: Schema.Types.ObjectId,
    ref: `user`,
    required: [true, `L'apprenant est obligatoire`]
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: `group`,
    required: [true, `La session est obligatoire`]
  },
},
schemaOptions)

SessionConversationSchema.index(
  {trainee:1, session:1},
  { unique: true, message: 'Une conversation existe déjà pour cet apprenant pour cette session' }
)

module.exports=SessionConversationSchema
