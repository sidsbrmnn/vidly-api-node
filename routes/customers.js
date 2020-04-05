const express = require('express');

const auth = require('../middlewares/auth');
const objectId = require('../middlewares/objectId');

const { Customer, validateCustomer } = require('../models/customer');

const { ClientError } = require('../util/error');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    const customers = await Customer.find().exec();

    res.send({ data: customers });
});

router.post('/', auth, async (req, res) => {
    const { error, value } = validateCustomer(req.body);
    if (error) {
        throw new ClientError(400, error.details[0].message);
    }

    let customer = await Customer.findOne({ email: value.email }).exec();
    if (customer) {
        throw new ClientError(409, 'Customer already exists');
    }

    customer = new Customer({ ...value });
    await customer.save();

    res.send({ data: customer._id });
});

router.put('/:id', [auth, objectId], async (req, res) => {
    const { error, value } = validateCustomer(req.body);
    if (error) {
        throw new ClientError(400, error.details[0].message);
    }

    const customer = await Customer.findOneAndUpdate(
        { _id: req.params.id },
        { ...value },
        { new: true }
    ).exec();
    if (!customer) {
        throw new Error(404, 'Customer not found');
    }

    res.send({ data: customer._id });
});

router.delete('/:id', [auth, objectId], async (req, res) => {
    const customer = await Customer.findOneAndDelete({
        _id: req.params.id,
    }).exec();
    if (!customer) {
        throw new Error(404, 'Customer not found');
    }

    res.send({ data: customer._id });
});

module.exports = router;
