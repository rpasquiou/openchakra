const moment=require('moment')
const mongoose=require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')
const { VISIO_STATUS_UNDEFINED, VISIO_STATUS_TO_COME, VISIO_STATUS_FINISHED, VISIO_STATUS_CURRENT } = require('../consts')
const { VISIO_TYPE_SESSION, VISIO_TYPE_GROUP, VISIO_TYPE_COACHING } = require('../../aftral-lms/consts')

const Schema = mongoose.Schema

const VisioSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: [true, `Le créateur est obligatoire`]
  },
  start_date: {
    type: Date,
    required: false,
  },
  // Duration in minutes: can be number of HH:mm
  duration: {
    type: Number,
    set: function(v) {
      if (typeof v=='string') {
        v=v.split(':').map(l => parseInt(l))
        v=v[0]*60+v[1]
      }
     return v
    },
    required: false,
  },
  end_date: {
    type: Date,
    required: false,
  },
  title: {
    type: 'String',
    required: [true, `Le titre est obligatoire`]
  },
  // Returns the visio type + the owner's name (group, session, trainee)
  type_str: {
    type: String,
    required: false,
  },
  // Url not required because will be provided
  url: {
    type: String,
    required: false,
  },
  _room: {
    type: String,
    required: false,
  },
  _owner: {
    type: Schema.Types.ObjectId,
    refPath: '_owner_type',
    required: [true, `L'id du propriétaire est obligatoire`]
  },
  _owner_type: {
    type: String,
    required: [true, `Le type du propriétaire est obligatoire`]
  },
}, schemaOptions)

/* eslint-disable prefer-arrow-callback */
VisioSchema.virtual('status', DUMMY_REF).get(function() {
  if (!this.start_date && !this.duration) {
    return VISIO_STATUS_UNDEFINED
  }
  if (moment().isBefore(this.start_date)) {
    return VISIO_STATUS_TO_COME
  }
  if (moment().isAfter(this.end_date)) {
    return VISIO_STATUS_FINISHED
  }
  return VISIO_STATUS_CURRENT
})

VisioSchema.virtual('type', DUMMY_REF).get(function() {
  const TYPES={
    group: VISIO_TYPE_GROUP,
    session: VISIO_TYPE_SESSION,
    user: VISIO_TYPE_COACHING,
  }
  return TYPES[this._owner_type]
})

VisioSchema.virtual('active', DUMMY_REF).get(function() {
  return !!this.start_date && !!this.end_date && moment().isBetween(moment(this.start_date).add(-10, 'minutes'), this.end_date)
})

VisioSchema.pre('validate',function(next) {
  console.log(this.start_date, this.duration, this.end_date)
  const dateConsistent=(!!this.start_date==!!this.duration) && (!!this.duration==!!this.end_date) 
  if (!dateConsistent) {
    return next(new Error(`Dates et durée doivent fournies`))
  }
  if (!!this.start_date && !!this.end_date && !!this.duration && !this.url) {
    return next(new Error(`L'URL doit êre fournie`))
  }
  return next()
})

/* eslint-enable prefer-arrow-callback */

module.exports = VisioSchema