const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')
const { DUMMY_REF } = require('../../../utils/database')

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
ExpertiseLevelSchema.virtual('expertise_level_STR',DUMMY_REF).get(function () {
    return `${this.expertise.name} : ${this.level}`
})
/* eslint-enable prefer-arrow-callback */

module.exports = ExpertiseLevelSchema