const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');

const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  text: {
    type: String,
    required: [true, `Le texte est obligatoire`],
  },
  todo: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur est obligatoire`],
  },
  document: {
    type: String,
    required: false,
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

module.exports = NoteSchema
