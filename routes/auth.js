const express = require('express');

const auth = require('../middlewares/auth');

const { User } = require('../models/user');

const ClientError = require('../util/error').ClientError;

const router = express.Router();

router.post('/', async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user) {
        throw new ClientError(401, 'Invalid email. Please register');
    }

    if (!(await user.checkPassword(req.body.password))) {
        throw new ClientError(401, 'Invalid password');
    }

    const token = user.generateAuthToken();
    res.send({ data: token });
});

router.get('/me', auth, async (req, res) => {
    const user = await User.findOne({ _id: res.locals.user._id })
        .select('-password')
        .exec();
    if (!user) {
        throw new ClientError(410, 'User does not exist');
    }

    res.send({ data: user });
});

module.exports = router;
