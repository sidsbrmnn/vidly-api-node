import express from 'express';
import jwtAuthz from 'express-jwt-authz';
import * as Yup from 'yup';
import { Movie } from '../entity/movie';
import jwtCheck from '../middleware/jwt-check';
import HttpError from '../util/http-error';
import knex from '../util/knex';

const router = express.Router();

const schema = Yup.object().shape({
  title: Yup.string().trim().required(),
  genreId: Yup.number().required(),
  stock: Yup.number().min(0).required(),
  rentalRate: Yup.number().min(0).required(),
});

router.get('/', async (req, res) => {
  const movies = await Movie.find();

  res.send({ data: movies });
});

router.post('/', jwtCheck, jwtAuthz(['write:movies']), async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

  const movie = Movie.create(value);
  await movie.save();

  res.send({ data: movie });
});

router.put('/:id', jwtCheck, jwtAuthz(['update:movies']), async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

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

router.delete(
  '/:id',
  jwtCheck,
  jwtAuthz(['delete:movies']),
  async (req, res) => {
    const result = await Movie.delete(parseInt(req.params.id, 10));
    if (!result.affected) {
      throw new HttpError(404, 'Movie not found');
    }

    res.send({ rows_affected: result.affected });
  }
);

router.get('/:id', async (req, res) => {
  const movie = await Movie.findOne(parseInt(req.params.id, 10));
  if (!movie) {
    throw new HttpError(404, 'Movie not found');
  }

  res.send({ data: movie });
});

export default router;
