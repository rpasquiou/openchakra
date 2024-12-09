const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const TableSchema = new Schema({
  tablemap: {
    type: Schema.Types.ObjectId,
    ref: 'tablemap',
    required: [true, `Le plan de table de la table est obligatoire`]
  },
  capacity: {
    type: Number,
    required: [true, `Le nombre de places est obligatoire`]
  },
  partner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports= TableSchema