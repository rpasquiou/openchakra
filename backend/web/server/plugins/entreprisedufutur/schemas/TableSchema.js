const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { PARTNER_LEVELS } = require('../consts')

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
  partner_number: {
    type: Number,
    required: true,
    default: 1,
    validate: [function (value) {return value > 0 && value <= this.capacity}, `Le nombre de places pour le partenaire doit être compris entre 1 et la taille de la table`]
  },
  partner_level: {
    type: String,
    enum: Object.keys(PARTNER_LEVELS),
    required: false
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports= TableSchema