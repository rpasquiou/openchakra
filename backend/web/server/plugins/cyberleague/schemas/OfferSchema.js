const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const OfferSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: [true,`L'entreprise proposant l'offre est obligatoire`]
  },
  title: {
    type: String,
    required: [true, `Le titre de l'offre est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = OfferSchema