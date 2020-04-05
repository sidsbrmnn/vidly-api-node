const express = require('express');

const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const objectId = require('../middlewares/objectId');

const { Genre } = require('../models/genre');
const { Movie, validateMovie } = require('../models/movie');

const ClientError = require('../util/error').ClientError;

const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie.find().exec();

    res.send({ data: movies });
});

router.post('/', [auth, admin], async (req, res) => {
    const { error, value } = validateMovie(req.body);
    if (error) {
        throw new ClientError(400, error.details[0].message);
    }

    const genre = await Genre.findOne({ _id: value.genre }).exec();
    if (!genre) {
        throw new ClientError(400, 'Invalid genre');
    }

    const movie = new Movie({ ...value });
    await movie.save();

    res.send({ data: movie._id });
});

router.put('/:id', [auth, admin, objectId], async (req, res) => {
    const { error, value } = validateMovie(req.body);
    if (error) {
        throw new ClientError(400, error.details[0].message);
    }

    const genre = await Genre.findOne({ _id: value.genre }).exec();
    if (!genre) {
        throw new ClientError(400, 'Invalid genre');
    }

    const movie = await Movie.findOneAndUpdate(
        { _id: req.params.id },
        { ...value },
        { new: true }
    ).exec();
    if (!movie) {
        throw new ClientError(404, 'Movie not found');
    }

    res.send({ data: movie._id });
});

router.delete('/:id', [auth, admin, objectId], async (req, res) => {
    const movie = await Movie.findOneAndDelete({ _id: req.params.id }).exec();
    if (!movie) {
        throw new ClientError(404, 'Movie not found');
    }

    res.send({ data: movie._id });
});

router.get('/:id', objectId, async (req, res) => {
    const movie = await Movie.findOne({ _id: req.params.id })
        .populate('genre')
        .exec();
    if (!movie) {
        throw new ClientError(404, 'Movie not found');
    }

    res.send({ data: movie });
});

module.exports = router;
