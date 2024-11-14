const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { idEqual } = require('../../../utils/database')
const { CREATED_AT_ATTRIBUTE } = require('../../../../utils/consts')
const User = require('../../../models/User')
const { ROLE_ADMIN } = require('../consts')
const Schema = mongoose.Schema

const ConversationSchema = new Schema({
  users: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    required: [value => value?.length==2, `Les deux utilisateurs sont requis`]
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  application: {
    type: mongoose.Schema.ObjectId,
    ref: 'application',
    required: false,
  },
},
schemaOptions)

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

ConversationSchema.virtual('latest_messages', {
  ref: 'message',
  localField: '_id',
  foreignField: 'conversation',
  options: { 
    sort: { [CREATED_AT_ATTRIBUTE]: -1 }, 
    limit: 1,
  },
})

ConversationSchema.statics.getFromUsers = async function({user1, user2, applicationId}) {
  if (!user1 || !user2) {
    throw new Error(`Expected all, got : \nuser1:${user1}\nuser2:${user2}`)
  }
  let conversation=await this.findOne({$and: [{users: user1},{users: user2}], ...applicationId ? {application: applicationId} : {}})
  if (!conversation) {
    conversation=await this.create({users: [user1, user2], ...applicationId ? {application: applicationId} : {}})
  }
  return conversation
};

ConversationSchema.methods.getPartner = function(me) {
  const partner=idEqual(this.users[0], me) ? this.users[1] : this.users[0]
  return partner
}

ConversationSchema.pre('validate', function(next) {
  if (!this.application) {
    return User.exists({
      _id: { $in: this.users },
      role: ROLE_ADMIN
    })
    .then(isAdmin => {
      if (!isAdmin) {
        return next(new Error(`Vous ne pouvez converser qu'avec un ADMIN ou dans le cadre d'une candidature`))
      }
      next()
    })
  } 
  else {
    return next()
  }
})

module.exports=ConversationSchema
