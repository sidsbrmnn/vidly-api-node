const express = require('express');

const Genre = require('../models/genre');

const router = express.Router();

router.get('/', async (req, res) => {
    const genres = await Genre.find().exec();

    res.send({ data: genres });
});

router.post('/', async (req, res) => {
    const genre = new Genre({ name: req.body.name });
    await genre.save();

    res.send({ data: genre._id });
});

router.put('/:id', async (req, res) => {
    const genre = await Genre.findOneAndUpdate(
        { _id: req.params.id },
        { name: req.body.name },
        { new: true }
    ).exec();
    if (!genre) {
        res.status(404).send({ error: 'No such document found' });
        return;
    }

    res.send({ data: genre._id });
});

router.delete('/:id', async (req, res) => {
    const genre = await Genre.findOneAndDelete({ _id: req.params.id }).exec();
    if (!genre) {
        res.status(404).send({ error: 'No such document found' });
        return;
    }

    res.send({ data: 'Document deleted successfully' });
});

router.get('/:id', async (req, res) => {
    const genre = await Genre.findOne({ _id: req.params.id }).exec();
    if (!genre) {
        res.status(404).send({ error: 'No such document found' });
        return;
    }

    res.send({ data: genre });
});

module.exports = router;
