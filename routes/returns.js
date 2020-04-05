const express = require('express');

const auth = require('../middlewares/auth');

const { Rental, validateRental } = require('../models/rental');
const { Movie } = require('../models/movie');

const { ClientError } = require('../util/error');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    const { error, value } = validateRental(req.body);
    if (error) {
        throw new ClientError(400, error.details[0].message);
    }

    const rental = await Rental.lookup(value.customer, value.movie);
    if (!rental) {
        throw new ClientError(404, 'Rental not found');
    }

    if (rental.dateReturned) {
        throw new ClientError(400, 'Return already processed');
    }

    const movie = Movie.findOneAndUpdate(
        { _id: value.movie },
        { $inc: { numberInStock: 1 } }
    );

    rental.return();
    await Promise.all([rental.save(), movie.exec()]);

    await Rental.populate(rental, [
        { path: 'customer' },
        { path: 'movie', populate: { path: 'genre' } },
    ]);
    return res.send({ data: rental });
});

module.exports = router;
