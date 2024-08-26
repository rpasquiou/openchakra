const mongoose = require("mongoose")
const { schemaOptions } = require("../../../utils/schemas")
const { ESTIMATED_DURATION_UNITS } = require('../consts')

const Schema = mongoose.Schema

const MissionSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "L'utilisateur créateur de la mission est requis"],
    },
    name: {
      type: String,
      required: [true, "Le nom de la mission est requis"],
    },
    date: {
      type: Date,
      required: [true, "La date de la mission est requise"],
    },
    required_expertises: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "expertise",
          index: true,
          required: true,
        },
      ],
      default: [],
    },
    budget: {
      type: String,
      required: false,
    },
    estimated_duration: {
      type: String,
      required: false,
    },
    estimation_duration_unit: {
      type: String,
      enum: Object.keys(ESTIMATED_DURATION_UNITS),
      required: false,
    },
    is_onsite: {
      type: Boolean,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    is_private: {
      type: Boolean,
      required: false,
    },
  },
  schemaOptions
)

module.exports = MissionSchema
