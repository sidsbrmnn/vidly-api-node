const express = require('express');
const Joi = require('joi');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const HttpError = require('../utils/http-error');
const knex = require('../utils/knex');

const router = express.Router();

const schema = {
  name: Joi.string().trim().required(),
};

router.get('/', async (req, res) => {
  const result = await knex('genres');

  res.send({ data: result });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const result = await knex('res').insert(value).returning('*');

  res.send({ data: result[0] });
});

router.put('/:id', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const result = await knex('genres')
    .update(value)
    .where('id', parseInt(req.params.id, 10));
  if (!result) {
    throw new HttpError(404, 'Genre not found');
  }

  res.send({ data: result });
});

router.delete('/:id', auth, admin, async (req, res) => {
  const result = await knex('genres')
    .where('id', parseInt(req.params.id, 10))
    .del();
  if (!result) {
    throw new HttpError(404, 'Genre not found');
  }

  res.send({ data: result });
});

router.get('/:id', async (req, res) => {
  const genre = await knex('genres')
    .where('id', parseInt(req.params.id, 10))
    .first();
  if (!genre) {
    throw new HttpError(404, 'Genre not found');
  }

  const movies = await knex('movies').where('genre_id', genre.id);

  res.send({ data: { ...genre, movies } });
});

module.exports = router;
