const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const PackSchema = new Schema({
  active: {
    type: Boolean,
    default: false,
    required: true,
  },
  title: {
    type: String,
    required: [true, `Le nom du pack est obligatoire`]
  },
  checkup: {
    type: Boolean,
    required: [true, `Indiquez si l'offre inclut un bilan`]
  },
  follow_count: {
    type: Number,
    min: [0, `Le nombre de suivis doit être positif ou nul`],
    required: [true, `Le nombre de suivis est obligatoire`]
  },
  price: {
    type: Number,
    min: [0, `Le tarif doit être positif`],
    required: [true, `Le tarif de l'offre est obligatoire`]
  },
  payment_count: {
    type: Number,
    min: [1, `Le nombre d'échéances de paiements doit être positif`],
    required: [true, `Le nombre d'échéances de paiements est obligatoire`]
  },
},
{...schemaOptions}
)

module.exports = PackSchema
