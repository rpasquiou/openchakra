const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas')

const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
  },
  url: {
    type: String,
    required: [true, `Le fichier est obligatoire`],
  },
}, schemaOptions
);

module.exports = DocumentSchema
