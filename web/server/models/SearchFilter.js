const mongoose = require('mongoose')
const Schema = mongoose.Schema

// TODO: supprimer ce modèle
const SearchFilterSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
})

module.exports = SearchFilterSchema
