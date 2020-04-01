const express = require('express');

const auth = require('../middlewares/auth');

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

router.get('/me', auth, async (req, res) => {
    const user = await User.findOne({ _id: res.locals.user._id })
        .select('-password')
        .exec();
    if (!user) {
        res.status(410).send({ error: 'User does not exist' });
        return;
    }

    res.send({ data: user });
});

module.exports = router;
