import express from 'express';
import jwtAuthz from 'express-jwt-authz';
import * as Yup from 'yup';
import { Genre } from '../entity/genre';
import jwtCheck from '../middleware/jwt-check';
import HttpError from '../util/http-error';

const router = express.Router();

const schema = Yup.object().shape({
  name: Yup.string().trim().required(),
});

router.get('/', async (req, res) => {
  const genres = await Genre.find();

  res.send({ data: genres });
});

router.post('/', jwtCheck, jwtAuthz(['write:genres']), async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

  const genre = Genre.create({ ...value });
  await genre.save();

  res.send({ data: genre });
});

router.put('/:id', jwtCheck, jwtAuthz(['update:genres']), async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

  const result = await Genre.update(parseInt(req.params.id, 10), { ...value });
  if (!result.affected) {
    throw new HttpError(404, 'Genre not found');
  }

  res.send({ rows_affected: result.affected });
});

router.delete(
  '/:id',
  jwtCheck,
  jwtAuthz(['delete:genres']),
  async (req, res) => {
    const result = await Genre.delete(parseInt(req.params.id, 10));
    if (!result.affected) {
      throw new HttpError(404, 'Genre not found');
    }

    res.send({ rows_affected: result.affected });
  }
);

router.get('/:id', async (req, res) => {
  const genre = await Genre.findOne(parseInt(req.params.id, 10));
  if (!genre) {
    throw new HttpError(404, 'Genre not found');
  }

  res.send({ data: genre });
});

export default router;
