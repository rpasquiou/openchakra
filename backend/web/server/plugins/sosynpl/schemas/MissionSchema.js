const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DUMMY_REF } = require("../../../utils/database");

const Schema = mongoose.Schema;

const MissionSchema = new Schema({
  application: {
    type: Schema.Types.ObjectId,
    ref: 'application',
    required: [true, `La candidature est obligatoire`],
  },
  title: {
    type: String,
    required: [true,  `Le nom de mission est obligatoire`],
  },
  start_date: {
    type: Date,
    required: [true, `La date de début est obligatoire`],
  },
  end_date: {
    type: Date,
    required: [true, `La date de fin est obligatoire`],
  },
}, schemaOptions
);

/* eslint-disable prefer-arrow-callback */
MissionSchema.virtual('progress', DUMMY_REF).get(function(){
  return 0
})
/* eslint-enable prefer-arrow-callback */


module.exports = MissionSchema;
