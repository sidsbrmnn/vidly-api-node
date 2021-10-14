import bcrypt from 'bcrypt';
import express from 'express';
import * as Yup from 'yup';
import { User } from '../entity/user';
import auth from '../middleware/jwt';
import knex from '../util/knex';

const router = express.Router();

const schema = Yup.object().shape({
  name: Yup.string().trim().required(),
  email: Yup.string().trim().lowercase().email().required(),
  password: Yup.string().required(),
  role: Yup.string().trim().lowercase().oneOf(['user', 'admin']),
});

router.get('/', auth, async (req, res) => {
  const users = await knex('users').select('id', 'name', 'email', 'role');

  res.send({ data: users });
});

router.post('/', async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

  const password = await bcrypt.hash(value.password, 12);
  const user = User.create({ ...value, password });
  await user.save();

  const token = user.generateToken();

  res.send({ token, token_type: 'Bearer' });
});

export default router;
