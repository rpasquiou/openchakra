const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const { HOME_STATUS } = require('../consts')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstname: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le prénom est obligatoire'],
  },
  lastname: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le nom de famille est obligatoire'],
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    set: v => v.toLowerCase().trim(),
  },
  pseudo: {
    type: String,
    set: v => v?.trim(),
    required: [true, 'Le pesudo est obligatoire'],
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: false,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    default: 'invalid',
  },
  home_status: {
    type: String,
    enum: Object.keys(HOME_STATUS),
    required: [true, 'Le status est obligatoire'],
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
// Required for register validation only
UserSchema.virtual('password2').get(function() {
})

UserSchema.virtual('fullname').get(function() {
  return `${this.firstname || ''} ${this.lastname || ''}`
})

UserSchema.virtual('scores').get(function() {
  const allData=[...this.viewed_contents, this.registered_events].map(d => d.key)
  const scores=lodash(allData)
      .groupBy(d => d._id.toString())
      .mapValues(v => v.length)
      .value()
  const mapped=scores.map(sc => {
    const key=allData.find(k => k._id.toString()==sc)
    return {...key, score: }
  })
  return scores
})

UserSchema.virtual('viewed_contents', {
  ref: 'contents', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'viewed_by', // is equal to foreignField
})

UserSchema.virtual('registered_events', {
  ref: 'event', // The Model to use
  localField: '_id', // Find in Model, where localField
  foreignField: 'registered_by', // is equal to foreignField
})

/* eslint-enable prefer-arrow-callback */


module.exports = UserSchema
