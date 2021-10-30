import express from 'express';
import jwtAuthz from 'express-jwt-authz';
import * as Yup from 'yup';
import { Customer } from '../entity/customer';
import jwtCheck from '../middleware/jwt-check';
import HttpError from '../util/http-error';
import knex from '../util/knex';

const router = express.Router();

router.use(jwtCheck);

const schema = Yup.object().shape({
  name: Yup.string().trim().required(),
  email: Yup.string().trim().lowercase().email().required(),
  phone: Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .required(),
});

router.get('/', jwtAuthz(['read:customers']), async (req, res) => {
  const customers = await Customer.find();

  res.send({ data: customers });
});

router.post('/', jwtAuthz(['write:customers']), async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

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

router.put('/:id', jwtAuthz(['update:customers']), async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

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

router.delete('/:id', jwtAuthz(['delete:customers']), async (req, res) => {
  const result = await Customer.delete(parseInt(req.params.id, 10));
  if (!result.affected) {
    throw new HttpError(404, 'Customer not found');
  }

  res.send({ rows_affected: result.affected });
});

router.get('/:id', jwtAuthz(['read:customers']), async (req, res) => {
  const customer = await Customer.findOne(parseInt(req.params.id, 10));
  if (!customer) {
    throw new HttpError(404, 'Customer not found');
  }

  // const rentals = await knex('rentals').where('customer_id', customer.id);
  // const movies = await knex('movies').whereIn(
  //   'id',
  //   rentals.map((rental) => rental.movie_id)
  // );
  // const returns = await knex('returns').whereIn(
  //   'rental_id',
  //   rentals.map((rental) => rental.id)
  // );

  // const data = {
  //   ...customer,
  //   rentals: rentals.map((rental) => ({
  //     ...rental,
  //     movie: movies.find((movie) => movie.id === rental.movie_id),
  //     returned: Boolean(returns.find((ret) => ret.rental_id === rental.id)),
  //   })),
  // };

  res.send({ data: customer });
});

export default router;
