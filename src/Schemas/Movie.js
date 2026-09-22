const mongoose = require('mongoose')
const { Schema } = mongoose

const movieSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    year: {
        type: Number,
        required: true
    },
    poster: String
})


const MovieModel = mongoose.model('Movie', movieSchema)

module.exports = MovieModel 