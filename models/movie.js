const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'genre',
        required: true,
    },
    numberInStock: { type: Number, min: 0, required: true },
    dailyRentalRate: { type: Number, min: 0, required: true },
});

const Movie = mongoose.model('movie', MovieSchema);

module.exports = Movie;
