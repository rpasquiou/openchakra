const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ExpertiseLevelSchema = new Schema({
    expertise:{
        type: Schema.Types.ObjectId,
        ref: 'expertise',
        required: [true, `L'expertise est obligatoire`],
    },
    leve: {
        type: Number,
        required: [true, `Le niveau d'expertise est obligatoire`],
    },
}, {schemaOptions})

module.exports = ExpertiseLevelSchema