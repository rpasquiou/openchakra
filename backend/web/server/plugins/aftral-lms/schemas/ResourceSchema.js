const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const Schema = mongoose.Schema
const {BLOCK_DISCRIMINATOR}=require('../consts')
const { DUMMY_REF } = require('../../../utils/database')

const ResourceSchema = new Schema({
  shortName: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Le créateur est obligatoire'],
  },
  optional: {
    type: Boolean,
    default: null,
    required: false,
  },
  mine: {
    type: Boolean,
  },
  liked: {
    type: Boolean,
    required: true,
    default: false,
  },
  disliked: {
    type: Boolean,
    default: false,
    required: true,
  },
  likes:{ 
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: []
  },
  dislikes:{ 
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
    required: true,
    default: []
  },
}, {...schemaOptions, ...BLOCK_DISCRIMINATOR})

ResourceSchema.virtual('likes_count', DUMMY_REF).get(function(){
  return this.likes.length || 0
})

ResourceSchema.virtual('dislikes_count', DUMMY_REF).get(function(){
  return this.dislikes.length || 0
})

module.exports = ResourceSchema
