const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const TablemapSchema = new Schema({
  
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

TablemapSchema.virtual('tables', {
  ref:'table',
  localField:'_id',
  foreignField:'tablemap',
})

/* eslint-enable prefer-arrow-callback */

module.exports= TablemapSchema