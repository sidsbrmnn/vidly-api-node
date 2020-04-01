const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    await user.save();

    const token = user.generateAuthToken();
    res.send({ data: token });
});

module.exports = router;
