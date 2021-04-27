const bcrypt = require('bcrypt');
const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
const HttpError = require('../utils/http-error');
const knex = require('../utils/knex');

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
  role: Joi.string().trim().lowercase().allow('user', 'admin'),
});

router.get('/', auth, async (req, res) => {
  const users = await knex('users').select('id', 'name', 'email', 'role');

  res.send({ data: users });
});

router.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  await knex.transaction(async (trx) => {
    const user = await knex('users').where('email', value.email).first();
    if (user) {
      throw new HttpError(409, 'User already exists');
    }

    value.password = await bcrypt.hash(value.password, 12);
    const result = await knex('users')
      .transacting(trx)
      .insert(value)
      .returning('*');
    const token = jwt.sign(
      { name: result[0].name, role: result[0].role },
      process.env.JWT_SECRET,
      { subject: result[0].id.toString() }
    );

    res.send({ data: token });
  });
});

module.exports = router;
