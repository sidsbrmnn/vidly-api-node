const express = require('express');

const { User, validateUser } = require('../models/user');

const ClientError = require('../util/error').ClientError;

const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        throw new ClientError(400, error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email }).exec();
    if (user) {
        throw new ClientError(409, 'User already exists. Please login');
    }

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    await user.save();

    const token = user.generateAuthToken();
    res.send({ data: token });
});

module.exports = router;
