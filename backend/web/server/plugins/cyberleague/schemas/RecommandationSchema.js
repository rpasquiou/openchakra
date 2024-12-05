const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const RecommandationSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur de la recommandation est obligatoire`]
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: [true, `L'entreprise recommandée est obligatoire`]
  },
  context: {
    type: String,
    required: [true, `Le contexte de la recommandation est obligatoire`]
  },
  comment: {
    type: String,
    required: [true, `Le commentaire de la recommandation est obligatoire`]
  },
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */

/* eslint-enable prefer-arrow-callback */

module.exports = RecommandationSchema