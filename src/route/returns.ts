import express from 'express';
import moment from 'moment';
import * as Yup from 'yup';
import auth from '../middleware/jwt';
import HttpError from '../util/http-error';
import knex from '../util/knex';

const router = express.Router();

const schema = Yup.object().shape({
  rental_id: Yup.number().min(0).required(),
});

router.post('/', auth, async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

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
    const fee = moment().diff(movie.created_at, 'days') * movie.rental_rate;

    const result = await knex('returns')
      .transacting(trx)
      .insert({ ...value, fee })
      .returning('*');

    await knex('movies')
      .transacting(trx)
      .increment('stock', 1)
      .where('id', movie.id);

    res.send({ data: result[0] });
  });
});

export default router;
