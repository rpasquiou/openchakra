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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [function() {return !this.lead}, `Un client/TI ou un prospect est obligatoire`],
  },
  lead: {
    type: Schema.Types.ObjectId,
    ref: 'lead',
    required: [function() {return !this.user}, `Un client/TI ou un prospect est obligatoire`],
  },
}, schemaOptions
);

module.exports = DocumentSchema
