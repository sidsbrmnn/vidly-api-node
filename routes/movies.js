const express = require('express');
const Joi = require('joi');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const Genre = require('../models/genre');
const Movie = require('../models/movie');
const HttpError = require('../utils/http-error');

const router = express.Router();

const schema = Joi.object({
  title: Joi.string().trim().required(),
  genre: Joi.string()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  numberInStock: Joi.number().min(0).required(),
  dailyRentalRate: Joi.number().min(0).required(),
});

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort('name');
  res.send({ data: movies });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await Genre.findOne({ _id: value.genre });
  if (!genre) {
    throw new HttpError(400, 'Invalid genre');
  }

  const movie = await Movie.create({ ...value, genre: genre._id });
  res.send({ data: movie });
});

router.put('/:id', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await Genre.findOne({ _id: value.genre });
  if (!genre) {
    throw new HttpError(400, 'Invalid genre');
  }

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    { ...value, genre: genre._id },
    { new: true }
  );
  if (!movie) {
    throw new HttpError(404, 'The movie with the given ID was not found.');
  }

  res.send({ data: movie });
});

router.delete('/:id', auth, admin, async (req, res) => {
  const movie = await Movie.findOneAndDelete({ _id: req.params.id });
  if (!movie) {
    throw new HttpError(404, 'The movie with the given ID was not found.');
  }

  res.send({ data: movie });
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findOne({ _id: req.params.id });
  if (!movie) {
    throw new HttpError(404, 'The movie with the given ID was not found.');
  }

  res.send({ data: movie });
});

module.exports = router;
