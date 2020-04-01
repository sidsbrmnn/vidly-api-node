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

    res.send({ data: user });
});

module.exports = router;
