const mongoose = require('mongoose')
const { schemaOptions } = require('../../../utils/schemas')
const { ESTIMATED_DURATION_UNITS, STATUSES, STATUS_ACTIVE, MISSION_VISIBILITY_PRIVATE, MISSION_VISIBILITY_PUBLIC } = require('../consts')
const { REGIONS } = require('../../../../utils/consts')
const { DUMMY_REF } = require('../../../utils/database')

const Schema = mongoose.Schema

const MissionSchema = new Schema(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, `L'utilisateur créateur de la mission est requis`],
    },
    name: {
      type: String,
      required: [true, `Le nom de la mission est requis`],
    },
    date: {
      type: Date,
      required: [true, `La date de la mission est requise`],
    },
    description: {
      type: String,
      required: [true, `La description est obligatoire`],
    },
    required_expertises: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'expertiseCategory',
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
    is_public: {
      type: Boolean,
      required: false,
    },
    companies: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'company',
          index: true,
          required: false,
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: Object.keys(STATUSES),
      dafault: STATUS_ACTIVE
    },
    region: {
      type: String,
      enum: Object.keys(REGIONS),
      required: false
    },
    budget: {
      type: Number,
      required: false
    },
  },
  schemaOptions
)

/* eslint-disable prefer-arrow-callback */

MissionSchema.virtual('visibility', DUMMY_REF).get(function() {
  return this.is_public ? MISSION_VISIBILITY_PUBLIC : MISSION_VISIBILITY_PRIVATE
})

/* eslint-enable prefer-arrow-callback */

module.exports = MissionSchema
