const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const Customer = require('../models/customer');
const Movie = require('../models/movie');
const Rental = require('../models/rental');
const HttpError = require('../utils/http-error');

const router = express.Router();

const schema = Joi.object({
  customerId: Joi.string()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  movieId: Joi.string()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
});

router.get('/', auth, async (req, res) => {
  const rentals = await Rental.find().sort('-dateOut');
  res.send({ data: rentals });
});

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const customer = await Customer.findOne({ _id: value.customerId });
  if (!customer) {
    throw new HttpError(400, 'Customer not found');
  }

  const movie = await Movie.findOne({ _id: value.movieId });
  if (!movie) {
    throw new HttpError(400, 'Movie not found');
  }
  if (movie.numberInStock === 0) {
    throw new HttpError(405, 'Movie is not in stock.');
  }

  let rental = await Rental.findOne({
    customer: customer._id,
    movie: movie._id,
  });
  if (rental) {
    throw new HttpError(405, 'Movie has already been rented by the customer.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    rental = await Rental.create(
      { customer: customer._id, movie: movie._id },
      { session }
    );
    await movie.update({ $inc: { numberInStock: -1 } }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.send({ data: rental });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    throw new Error('Unable to rent the movie at the moment.');
  }
});

router.get('/:id', [auth], async (req, res) => {
  const rental = await Rental.findOne({ _id: req.params.id });
  if (!rental) {
    throw new HttpError(404, 'The rental with the given ID was not found.');
  }

  res.send({ data: rental });
});

module.exports = router;
