const express = require('express');

const auth = require('../middlewares/auth');

const Genre = require('../models/genre');
const Movie = require('../models/movie');

const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movie.find().exec();

    res.send({ data: movies });
});

router.post('/', auth, async (req, res) => {
    const genre = await Genre.findOne({ _id: req.body.genreId }).exec();
    if (!genre) {
        res.status(400).send({ error: 'Invalid genre' });
        return;
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

router.put('/:id', auth, async (req, res) => {
    const genre = await Genre.findOne({ _id: req.body.genreId }).exec();
    if (!genre) {
        res.status(400).send({ error: 'Invalid genre' });
        return;
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

router.delete('/:id', auth, async (req, res) => {
    const movie = await Movie.findOneAndDelete({ _id: req.params.id }).exec();
    if (!movie) {
        res.status(404).send({ error: 'No such document found' });
        return;
    }

    res.send({ data: 'Document deleted successfully' });
});

router.get('/:id', async (req, res) => {
    const movie = await Movie.findOne({ _id: req.params.id })
        .populate('genre')
        .exec();
    if (!movie) {
        res.status(404).send({ error: 'No such document found' });
        return;
    }

    res.send({ data: movie });
});

module.exports = router;
