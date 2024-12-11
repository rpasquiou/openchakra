const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const TablemapSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: [true, `L'événement du plan de table est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

TablemapSchema.virtual('tables', {
  ref:'table',
  localField:'_id',
  foreignField:'tablemap',
})

/* eslint-enable prefer-arrow-callback */

module.exports= TablemapSchema