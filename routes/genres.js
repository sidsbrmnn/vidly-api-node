const express = require('express');
const Joi = require('joi');
const admin = require('../middlewares/admin');
const auth = require('../middlewares/auth');
const Genre = require('../models/genre');
const HttpError = require('../utils/http-error');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().trim().required(),
});

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send({ data: genres });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await Genre.create({ ...value });
  res.send({ data: genre });
});

router.put('/:id', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await Genre.findOneAndUpdate(
    { _id: req.params.id },
    { ...value },
    { new: true }
  );
  if (!genre) {
    throw new HttpError(404, 'The genre with the given ID was not found.');
  }

  res.send({ data: genre });
});

router.delete('/:id', auth, admin, async (req, res) => {
  const genre = await Genre.findOneAndDelete({ _id: req.params.id });
  if (!genre) {
    throw new HttpError(404, 'The genre with the given ID was not found.');
  }

  res.send({ data: genre });
});

router.get('/:id', async (req, res) => {
  const genre = await Genre.findOne({ _id: req.params.id });
  if (!genre) {
    throw new HttpError(404, 'The genre with the given ID was not found.');
  }

  res.send({ data: genre });
});

module.exports = router;
