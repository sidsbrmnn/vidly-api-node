const express = require('express');

const auth = require('../middlewares/auth');
const objectId = require('../middlewares/objectId');

const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');
const { Rental, validateRental } = require('../models/rental');

const { ClientError } = require('../util/error');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut').exec();

    res.send({ data: rentals });
});

router.post('/', auth, async (req, res) => {
    const { error, value } = validateRental(req.body);
    if (error) {
        throw new ClientError(400, error.details[0].message);
    }

    const customer = await Customer.findOne({ _id: value.customer });
    if (!customer) {
        throw new ClientError(400, 'Customer does not exist');
    }

    const movie = await Movie.findOne({ _id: value.movie });
    if (!movie) {
        throw new ClientError(400, 'Movie does not exist');
    }

    if (movie.numberInStock === 0) {
        throw new ClientError(400, 'Oops. Movie is out of stock');
    }

    movie.numberInStock -= 1;
    const rental = new Rental({ ...value });
    await Promise.all([rental.save(), movie.save()]);

    res.send({ data: rental._id });
});

router.get('/:id', [auth, objectId], async (req, res) => {
    const rental = await Rental.findOne({ _id: req.params.id })
        .populate('customer')
        .populate({ path: 'movie', populate: { path: 'genre' } })
        .exec();
    if (!rental) {
        throw new ClientError(404, 'Rental not found');
    }

    res.send({ data: rental });
});

module.exports = router;
