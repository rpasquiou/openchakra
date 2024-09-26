const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ExpertiseLevelSchema = new Schema({
    expertise:{
        type: Schema.Types.ObjectId,
        ref: 'expertise',
        required: [true, `L'expertise est obligatoire`],
    },
    level: {
        type: Number,
        required: [true, `Le niveau d'expertise est obligatoire`],
    },
}, {schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseLevelSchema