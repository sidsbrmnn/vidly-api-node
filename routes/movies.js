const express = require('express');

const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');

const Genre = require('../models/genre');
const Movie = require('../models/movie');

const ClientError = require('../util/error').ClientError;

const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie.find().exec();

    res.send({ data: movies });
});

router.post('/', [auth, admin], async (req, res) => {
    const genre = await Genre.findOne({ _id: req.body.genreId }).exec();
    if (!genre) {
        throw new ClientError(400, 'Invalid genre');
    }

    const movie = new Movie({
        title: req.body.title,
        genre: genre._id,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
    });
    await movie.save();

    res.send({ data: movie._id });
});

router.put('/:id', [auth, admin], async (req, res) => {
    const genre = await Genre.findOne({ _id: req.body.genreId }).exec();
    if (!genre) {
        throw new ClientError(400, 'Invalid genre');
    }

    const movie = await Movie.findOneAndUpdate(
        { _id: req.params.id },
        {
            title: req.body.title,
            genre: genre._id,
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate,
        },
        { new: true }
    ).exec();

    res.send({ data: movie._id });
});

router.delete('/:id', [auth, admin], async (req, res) => {
    const movie = await Movie.findOneAndDelete({ _id: req.params.id }).exec();
    if (!movie) {
        throw new ClientError(410, 'Movie does not exist');
    }

    res.send({ data: 'Movie deleted successfully' });
});

router.get('/:id', async (req, res) => {
    const movie = await Movie.findOne({ _id: req.params.id })
        .populate('genre')
        .exec();
    if (!movie) {
        throw new ClientError(404, 'Movie not found');
    }

    res.send({ data: movie });
});

module.exports = router;