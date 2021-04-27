const express = require('express');
const Joi = require('joi');
const auth = require('../middlewares/auth');
const HttpError = require('../utils/http-error');
const knex = require('../utils/knex');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .required(),
});

router.get('/', auth, async (req, res) => {
  const result = await knex('customers').orderBy('name');

  res.send({ data: result });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  await knex.transaction(async (trx) => {
    const customers = await knex('customers')
      .where('email', value.email)
      .orWhere('phone', value.phone)
      .first()
      .transacting(trx);
    if (customers) {
      throw new HttpError(409, 'Customer already exists');
    }

    const result = await knex('customers')
      .insert(value)
      .returning('*')
      .transacting(trx);

    res.send({ data: result[0] });
  });
});

router.put('/:id', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  await knex.transaction(async (trx) => {
    const customers = await knex('customers')
      .transacting(trx)
      .where('email', value.email)
      .orWhere('phone', value.phone)
      .andWhereNot('id', parseInt(req.params.id, 10));
    if (customers.length) {
      throw new HttpError(409, 'Customer already exists');
    }

    const result = await knex('customers')
      .transacting(trx)
      .update(value)
      .where('id', parseInt(req.params.id, 10));
    if (!result) {
      throw new HttpError(404, 'Customer not found');
    }

    res.send({ data: result });
  });
});

router.delete('/:id', auth, async (req, res) => {
  const result = await knex('customers')
    .where('id', parseInt(req.params.id, 10))
    .del();
  if (!result) {
    throw new HttpError(404, 'Customer not found');
  }

  res.send({ data: result });
});

router.get('/:id', auth, async (req, res) => {
  const customer = await knex('customers')
    .where('id', parseInt(req.params.id, 10))
    .first();
  if (!customer) {
    throw new HttpError(404, 'Customer not found');
  }

  const rentals = await knex('rentals').where('customer_id', customer.id);
  const movies = await knex('movies').whereIn(
    'id',
    rentals.map((rental) => rental.movie_id)
  );
  const returns = await knex('returns').whereIn(
    'rental_id',
    rentals.map((rental) => rental.id)
  );

  const data = {
    ...customer,
    rentals: rentals.map((rental) => ({
      ...rental,
      movie: movies.find((movie) => movie.id === rental.movie_id),
      returned: Boolean(returns.find((ret) => ret.rental_id === rental.id)),
    })),
  };

  res.send({ data });
});

module.exports = router;
