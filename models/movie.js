const Joi = require('@hapi/joi');
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

/**
 *
 * @param {Object} movie
 * @param {string} movie.title
 * @param {string} movie.genreId
 * @param {number} movie.numberInStock
 * @param {number} movie.dailyRentalRate
 */
function validateMovie(movie) {
    const schema = Joi.object({
        title: Joi.string().required(),
        genreId: Joi.string().required(),
        numberInStock: Joi.number()
            .min(0)
            .required(),
        dailyRentalRate: Joi.number()
            .min(0)
            .required(),
    });

    return schema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validateMovie = validateMovie;
