const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ProgressSchema = new Schema({
    program: {
        type: Schema.Types.ObjectId,
        ref: 'program',
        required: [true, 'Le programme est obligatoire'],
    },
    resource: {
        type: Schema.Types.ObjectId,
        ref:'resource',
        required: [true, 'La ressource est obligatoire'],
    },
    completed: {
        type: Boolean,
        required: [true, 'La progression est obligatoire']
    }
}, {schemaOptions})

module.exports= ProgressSchema