const express = require('express');

const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');

const Genre = require('../models/genre');

const ClientError = require('../util/error').ClientError;

const router = express.Router();

router.get('/', async (req, res) => {
    const genres = await Genre.find().exec();

    res.send({ data: genres });
});

router.post('/', [auth, admin], async (req, res) => {
    const genre = new Genre({ name: req.body.name });
    await genre.save();

    res.send({ data: genre._id });
});

router.put('/:id', [auth, admin], async (req, res) => {
    const genre = await Genre.findOneAndUpdate(
        { _id: req.params.id },
        { name: req.body.name },
        { new: true }
    ).exec();
    if (!genre) {
        throw new ClientError(404, 'Genre not found');
    }

    res.send({ data: genre._id });
});

router.delete('/:id', [auth, admin], async (req, res) => {
    const genre = await Genre.findOneAndDelete({ _id: req.params.id }).exec();
    if (!genre) {
        throw new ClientError(410, 'Genre does not exist');
    }

    res.send({ data: 'Genre deleted successfully' });
});

router.get('/:id', async (req, res) => {
    const genre = await Genre.findOne({ _id: req.params.id }).exec();
    if (!genre) {
        throw new ClientError(404, 'Genre not found');
    }

    res.send({ data: genre });
});

module.exports = router;
