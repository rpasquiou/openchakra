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
    required: [true, `La/Les sessions sont obligatoires`]
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
  can_post: {
    type: Boolean,
    required: true,
    default: true,
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
  const trainees = this.trainees.map(obj => obj._id)
  const availableTrainees = this.available_trainees.map(obj => obj._id)
  const differenceIds = availableTrainees.filter(id => !trainees.some(traineeId => idEqual(traineeId, id)))
  return differenceIds
})

module.exports = GroupSchema