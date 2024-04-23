const mongoose = require(`mongoose`)
const {schemaOptions} = require(`../../../utils/schemas`)
const lodash=require(`lodash`)
const {COMPANY_ACTIVITY, COMPANY_SIZE, TICKET_PRIORITY}=require(`../consts`)

const Schema = mongoose.Schema

const TicketCommentSchema = new Schema(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'ticket',
      required: [true, `Le ticket est obligatoire`],
    },
    text: {
      type: String,
      required: [true, `Le texte est obligatoire`],
    },
    /** Returned by Smartdiet */
    date: {
      type: Date,
      required: false,
    },
    /** Returned by Smartdiet */ 
  }, schemaOptions,
)

module.exports = TicketCommentSchema
