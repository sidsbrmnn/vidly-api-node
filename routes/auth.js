const bcrypt = require('bcrypt');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const HttpError = require('../utils/http-error');
const knex = require('../utils/knex');

const router = express.Router();

const schema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

router.get('/', auth, async (req, res) => {
  const result = await knex('users')
    .select('id', 'name', 'email', 'role')
    .where('id', parseInt(req.user.sub, 10));

  res.send({ data: result });
});

router.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const result = await knex('users').where('email', value.email).first();
  if (!result) {
    throw new HttpError(400, 'Invalid email or password');
  }

  const same = await bcrypt.compare(value.password, result.password);
  if (!same) {
    throw new HttpError(400, 'Invalid email or password');
  }

  const token = jwt.sign(
    { name: result.name, role: result.role },
    process.env.JWT_SECRET,
    { subject: result.id.toString() }
  );

  res.send({ data: token });
});

module.exports = router;
