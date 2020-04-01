const Joi = require('@hapi/joi');
const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const Genre = mongoose.model('genre', GenreSchema);

/**
 *
 * @param {Object} genre
 * @param {string} genre.name
 */
function validateGenre(genre) {
    const schema = Joi.object({
        name: Joi.string().required(),
    });

    return schema.validate(genre);
}

module.exports.Genre = Genre;
module.exports.validateGenre = validateGenre;
