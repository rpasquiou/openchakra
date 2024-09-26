const mongoose = require('mongoose')
const {schemaOptions} = require('../../../utils/schemas')

const Schema = mongoose.Schema

const ProgramSchema = new Schema({
    modules: {
        type: Schema.Types.ObjectId,
        ref: 'cLModule',
        required: [true, 'Les modules sont obligatoires'],
    },
    name: {
        type: String,
        required: [true, 'Le nom du programme est obligatoire'],
    },
    picture: {
        type: String,
        required: false,
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Le créateur du programme est obligatoire']
    }
}, {...schemaOptions})

/* eslint-disable prefer-arrow-callback */
/* eslint-enable prefer-arrow-callback */

module.exports= ProgramSchema