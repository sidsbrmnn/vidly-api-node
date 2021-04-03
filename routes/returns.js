const express = require('express');
const Joi = require('joi');
const moment = require('moment');
const auth = require('../middlewares/auth');
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

router.post('/', auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  let rental = await Rental.findOne({
    customer: value.customerId,
    movie: value.movieId,
  })
    .populate('movie')
    .exec();
  if (!rental) {
    throw new HttpError(405, 'Customer has not rented the selected movie.');
  }
  if (rental.dateReturned) {
    throw new HttpError(405, 'Return has already been processed.');
  }

  const session = await Rental.startSession();
  session.startTransaction();

  try {
    rental = await rental.update(
      {
        dateReturned: Date.now(),
        rentalFee:
          moment().diff(this.dateOut, 'days') * rental.movie.dailyRentalRate,
      },
      { new: true, session }
    );
    await Movie.findOneAndUpdate(
      { _id: rental.movie._id },
      { $inc: { numberInStock: 1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.send({ data: rental });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    throw new HttpError(500, 'Unable to return the movie at the momenet.');
  }
});

module.exports = router;
