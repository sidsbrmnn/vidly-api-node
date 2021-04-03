const express = require('express');
const Joi = require('joi');
const auth = require('../middlewares/auth');
const User = require('../models/user');
const HttpError = require('../utils/http-error');

const router = express.Router();

const schema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

router.get('/', auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user.sub });
  res.send({ data: user });
});

router.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const user = await User.findOne({ email: value.email });
  if (!user) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const isValidPassword = await user.comparePassword(value.password);
  if (!isValidPassword) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const token = user.generateAuthToken();
  res.send({ data: token });
});

module.exports = router;
