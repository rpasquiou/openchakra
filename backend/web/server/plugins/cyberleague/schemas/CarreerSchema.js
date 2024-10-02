const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { CONTRACT_TYPES } = require('../consts')

const Schema = mongoose.Schema

const CarreerSchema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'company',
      required: [true,`L'entreprise proposant l'emploi est obligatoire`]
    },
    position: {
      type: String,
      required: [true, `L'intitulé de poste est obligatoire`]
    },
    contract_type: {
      type: String,
      enum: Object.keys(CONTRACT_TYPES),
      required: [true, `Le type de contrat est obligatoire`]
    },
    candidates: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
      }],
      default: []
    },
  },
  schemaOptions
)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CarreerSchema