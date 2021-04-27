const express = require('express');
const Joi = require('joi');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const HttpError = require('../utils/http-error');
const knex = require('../utils/knex');

const router = express.Router();

const schema = Joi.object({
  title: Joi.string().trim().required(),
  genre_id: Joi.number().required(),
  stock: Joi.number().min(0).required(),
  rental_rate: Joi.number().min(0).required(),
});

router.get('/', async (req, res) => {
  const movies = await knex('movies');

  res.send({ data: movies });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await knex('genres').where('id', value.genre_id).first();
  if (!genre) {
    throw new HttpError(400, 'Invalid genre');
  }

  const result = await knex('movies').insert(value).returning('*');

  res.send({ data: result[0] });
});

router.put('/:id', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await knex('genres').where('id', value.genre_id).first();
  if (!genre) {
    throw new HttpError(400, 'Invalid genre');
  }

  const result = await knex('movies')
    .update(value)
    .where('id', parseInt(req.params.id, 10));
  if (!result) {
    throw new HttpError(404, 'Movie not found');
  }

  res.send({ data: result });
});

router.delete('/:id', auth, admin, async (req, res) => {
  const result = await knex('movies')
    .where('id', parseInt(req.params.id, 10))
    .del();
  if (!result) {
    throw new HttpError(404, 'Movie not found');
  }

  res.send({ data: result });
});

router.get('/:id', async (req, res) => {
  const movie = await knex('movies')
    .where('id', parseInt(req.params.id, 10))
    .first();
  if (!movie) {
    throw new HttpError(404, 'Movie not found');
  }

  const genre = await knex('genres').where('id', movie.genre_id).first();

  res.send({ data: { ...movie, genre } });
});

module.exports = router;
