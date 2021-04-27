const express = require('express');
const Joi = require('joi');
const moment = require('moment');
const auth = require('../middlewares/auth');
const HttpError = require('../utils/http-error');
const knex = require('../utils/knex');

const router = express.Router();

const schema = Joi.object({
  rental_id: Joi.number().min(0).required(),
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const rental = await knex('rentals').where('id', value.rental_id).first();
  if (!rental) {
    throw new HttpError(404, 'Rental not found');
  }

  await knex.transaction(async (trx) => {
    const ret = await knex('returns').where('rental_id', rental.id).first();
    if (ret) {
      throw new HttpError(409, 'Return already processed');
    }

    const movie = await knex('movies')
      .transacting(trx)
      .forUpdate()
      .where('id', rental.movie_id)
      .first();
    value.fee = moment().diff(movie.created_at, 'days') * movie.rental_rate;

    const result = await knex('returns')
      .transacting(trx)
      .insert(value)
      .returning('*');

    await knex('movies')
      .transacting(trx)
      .increment('stock', 1)
      .where('id', movie.id);

    res.send({ data: result[0] });
  });
});

module.exports = router;
