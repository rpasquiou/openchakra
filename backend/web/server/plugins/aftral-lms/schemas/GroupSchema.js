const mongoose = require(`mongoose`)
const lodash = require(`lodash`)
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
  can_post_feed: {
    type: Boolean,
    required: true,
    default: false,
  },
  visible_feed: {
    type: Boolean,
    required: true,
    default: false,
  },
  visios: [{
    type: Schema.Types.ObjectId,
    ref: 'visioDay',
  }],
}, schemaOptions)

GroupSchema.virtual('trainees_count', DUMMY_REF).get(function(){
  return lodash.sum(this.sessions?.map(s => s.trainees?.length))
})

module.exports = GroupSchema