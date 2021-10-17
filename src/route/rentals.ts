import express from 'express';
import jwtAuthz from 'express-jwt-authz';
import * as Yup from 'yup';
import { Rental } from '../entity/rental';
import jwtCheck from '../middleware/jwt-check';
import HttpError from '../util/http-error';
import knex from '../util/knex';

const router = express.Router();

router.use(jwtCheck);

const schema = Yup.object().shape({
  customer_id: Yup.number().min(0).required(),
  movie_id: Yup.number().min(0).required(),
});

router.get('/', jwtAuthz(['read:rentals']), async (req, res) => {
  const rentals = await Rental.find();

  // const customers = await knex('customers').whereIn(
  //   'id',
  //   rentals.map((rental) => rental.customer_id)
  // );
  // const movies = await knex('movies').whereIn(
  //   'id',
  //   rentals.map((rental) => rental.movie_id)
  // );
  // const returns = await knex('returns').whereIn(
  //   'rental_id',
  //   rentals.map((rental) => rental.id)
  // );

  // const data = rentals.map((rental) => ({
  //   ...rental,
  //   customer: customers.find((customer) => customer.id === rental.customer_id),
  //   movie: movies.find((movie) => movie.id === rental.movie_id),
  //   returned: Boolean(returns.find((ret) => ret.rental_id === rental.id)),
  // }));

  res.send({ data: rentals });
});

router.post('/', jwtAuthz(['write:rentals']), async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

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

router.get('/:id', jwtAuthz(['read:rentals']), async (req, res) => {
  const rental = await Rental.findOne(parseInt(req.params.id, 10));
  if (!rental) {
    throw new HttpError(404, 'Rental not found');
  }

  // const customer = await knex('customers')
  //   .where('id', rental.customer_id)
  //   .first();
  // const movie = await knex('movies').where('id', rental.movie_id).first();
  // const ret = await knex('returns').where('rental_id', rental.id).first();

  // const data = {
  //   ...rental,
  //   customer,
  //   movie,
  //   returned_on: ret && ret.created_at,
  //   amount: ret && ret.fee,
  // };

  res.send({ data: rental });
});

export default router;
