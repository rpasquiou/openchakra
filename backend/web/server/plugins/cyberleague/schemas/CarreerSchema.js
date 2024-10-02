const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')

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
  },
  schemaOptions
)

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = CarreerSchema