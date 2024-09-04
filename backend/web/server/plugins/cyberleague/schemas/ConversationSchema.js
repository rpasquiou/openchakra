const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas.js')
const { CREATED_AT_ATTRIBUTE } = require('../../../../utils/consts.js')
const { idEqual } = require('../../../utils/database')
const Schema = mongoose.Schema

const ConversationSchema = new Schema(
  {
    users: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
          required: true,
        },
      ],
      validate: [
        (value) => value?.length == 2,
        `Les deux utilisateurs sont requis`,
      ],
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null
    },
  },
  schemaOptions
)

ConversationSchema.virtual('messages', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
})

ConversationSchema.virtual('messages_count', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
  count: true,
})

ConversationSchema.virtual('latest_message', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
  options: {
    sort: { [CREATED_AT_ATTRIBUTE]: -1 },
    limit: 1,
  },
})

ConversationSchema.statics.getFromUsers = async function ({ user1, user2 }) {
  if (!user1 || !user2) {
    throw new Error(`Expected all, got : \nuser1:${user1}\nuser2:${user2}`)
  }
  let conversation = await this.findOne({
    $and: [{ users: user1 }, { users: user2 }],
  })
  if (!conversation) {
    conversation = await this.create({ users: [user1, user2] })
  }
  return conversation
}

ConversationSchema.methods.getPartner = async function(me) {
  const partner=idEqual(this.users[0], me) ? this.users[1] : this.users[0]
  return partner
}

module.exports = ConversationSchema
