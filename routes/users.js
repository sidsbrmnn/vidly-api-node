const express = require('express');
const Joi = require('joi');
const User = require('../models/user');
const HttpError = require('../utils/http-error');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

router.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  let user = await User.findOne({ email: value.email });
  if (user) {
    throw new HttpError(409, 'User has already registered.');
  }

  user = await User.create({ ...value });

  const token = user.generateAuthToken();
  res.send({ data: token });
});

module.exports = router;
