const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.post('/', async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        res.status(401).send({ error: 'Invalid email. Please register' });
        return;
    }

    if (!user.checkPassword(req.body.password)) {
        res.status(401).send({ error: 'Invalid password' });
        return;
    }

    const token = user.generateAuthToken();
    res.send({ data: token });
});

module.exports = router;
