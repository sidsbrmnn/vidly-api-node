const express = require('express');
const Joi = require('joi');
const auth = require('../middlewares/auth');
const HttpError = require('../utils/http-error');
const knex = require('../utils/knex');

const router = express.Router();

const schema = Joi.object({
  customer_id: Joi.number().min(0).required(),
  movie_id: Joi.number().min(0).required(),
});

router.get('/', auth, async (req, res) => {
  const rentals = await knex('rentals');

  const customers = await knex('customers').whereIn(
    'id',
    rentals.map((rental) => rental.customer_id)
  );
  const movies = await knex('movies').whereIn(
    'id',
    rentals.map((rental) => rental.movie_id)
  );
  const returns = await knex('returns').whereIn(
    'rental_id',
    rentals.map((rental) => rental.id)
  );

  const data = rentals.map((rental) => ({
    ...rental,
    customer: customers.find((customer) => customer.id === rental.customer_id),
    movie: movies.find((movie) => movie.id === rental.movie_id),
    returned: Boolean(returns.find((ret) => ret.rental_id === rental.id)),
  }));

  res.send({ data });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  await knex.transaction(async (trx) => {
    const customer = await knex('customers')
      .where('id', value.customer_id)
      .first();
    if (!customer) {
      throw new HttpError(400, 'Customer not found');
    }

    const movie = await knex('movies')
      .transacting(trx)
      .forUpdate()
      .where('id', value.movie_id)
      .first();
    if (!movie) {
      throw new HttpError(400, 'Movie not found');
    }

    if (movie.stock === 0) {
      throw new HttpError(400, 'Movie out of stock');
    }

    const result = await knex('rentals')
      .transacting(trx)
      .insert(value)
      .returning('*');

    await knex('movies')
      .transacting(trx)
      .decrement('stock', 1)
      .where('id', value.movie_id);

    res.send({ data: result[0] });
  });
});

router.get('/:id', auth, async (req, res) => {
  const rental = await knex('rentals')
    .where('id', parseInt(req.params.id, 10))
    .first();
  if (!rental) {
    throw new HttpError(404, 'Rental not found');
  }

  const customer = await knex('customers')
    .where('id', rental.customer_id)
    .first();
  const movie = await knex('movies').where('id', rental.movie_id).first();
  const ret = await knex('returns').where('rental_id', rental.id).first();

  const data = {
    ...rental,
    customer,
    movie,
    returned_on: ret && ret.created_at,
    amount: ret && ret.fee,
  };

  res.send({ data });
});

module.exports = router;
