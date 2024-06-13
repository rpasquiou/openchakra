const mongoose = require(`mongoose`)
const {schemaOptions} = require(`../../../utils/schemas`)
const lodash=require(`lodash`)
const {COMPANY_ACTIVITY, COMPANY_SIZE, TICKET_PRIORITY}=require(`../consts`)

const Schema = mongoose.Schema

const TicketSchema = new Schema(
  {
    sender: {
      type: String,
      required: [true, `Le mail du créateur est obligatoire`],
    },
    subject: {
      type: String,
      required: [true, `Le sujet est obligatoire`],
    },
    message: {
      type: String,
      required: [true, `Le message est obligatoire`],
    },
    priority: {
      type: String,
      enum: Object.keys(TICKET_PRIORITY),
      set: v => v || undefined,
      required: [true, `La priorité est obligatoire`],
    },
    /** Returned by Smartdiet */
    status: {
      type: String,
      required: false,
    },
    jiraiid: {
      type: Number,
      required: false,
    },
    date: {
      type: Date,
      required: false,
    },
    /** Returned by Smartdiet */  },
  schemaOptions,
)

// Returns my reviewz
TicketSchema.virtual(`comments`, {
  ref: `ticketComment`, // The Model to use
  localField: `_id`, // Find in Model, where localField
  foreignField: `ticket`, // is equal to foreignField
})


module.exports = TicketSchema
