const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const TablemapSchema = new Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'event',
    required: [true, `L'événement du plan de table est obligatoire`]
  },
  table_number: {
    type: Number,
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports= TablemapSchema