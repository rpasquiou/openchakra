const mongoose = require(`mongoose`)
const { schemaOptions } = require(`../../../utils/schemas`)
const { DUMMY_REF, idEqual } = require("../../../utils/database")
const Schema = mongoose.Schema
const GroupSchema = new Schema({
  name: {
    type: String,
    required: [true, `Le nom est obligatoire`]
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: `user`,
    required: [true, `Le formateur est obligatoire`],
  },
  sessions: [{
    type: Schema.Types.ObjectId,
    ref: `session`,
    required: false,
  }],
  picture: {
    type: String,
    required: false,
  },
  feed: {
    type: Schema.Types.ObjectId,
    ref: `feed`,
    required: false,
  },
  cant_post: {
    type: Boolean,
    required: true,
    default: false,
  },
  trainees: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: `user`,
    }],
    required: true,
    default: []
  },
  available_trainees: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: `user`
    }],
    required: true,
    default: [],
  },
}, schemaOptions)

GroupSchema.virtual('excluded_trainees', DUMMY_REF).get(function(){
  return []
  // const trainees = this.trainees.map(obj => obj._id)
  // const availableTrainees = this.available_trainees.map(obj => obj._id)
  // const differenceIds = availableTrainees.filter(id => !trainees.some(traineeId => idEqual(traineeId, id)))
  // return differenceIds
})

GroupSchema.virtual('trainees_count', DUMMY_REF).get(function(){
  return this.trainees? this.trainees.length : 0
})

GroupSchema.virtual('available_trainees_count', DUMMY_REF).get(function(){
  return this.available_trainees? this.available_trainees.length : 0
})

GroupSchema.virtual('excluded_trainees_count', DUMMY_REF).get(function(){
  return this.available_trainees.length - this.trainees.length
})

module.exports = GroupSchema