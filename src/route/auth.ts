import bcrypt from 'bcrypt';
import express from 'express';
import { UnauthorizedError } from 'express-jwt';
import * as Yup from 'yup';
import { User } from '../entity/user';
import jwt from '../middleware/jwt';
import HttpError from '../util/http-error';

const router = express.Router();

const schema = Yup.object().shape({
  email: Yup.string().trim().lowercase().email().required(),
  password: Yup.string().required(),
});

router.get('/', jwt, async (req, res) => {
  const user = await User.findOne(parseInt(req.user!.sub, 10));
  if (!user) {
    throw new UnauthorizedError('revoked_token', { message: '' });
  }

  res.send({ data: user });
});

router.post('/', async (req, res) => {
  const value = await schema.validate(req.body, { stripUnknown: true });

  let user = await User.findOne({ email: value.email });
  if (!user) {
    throw new HttpError(400, 'Invalid email or password');
  }

  const validPassword = await bcrypt.compare(value.password, user.password);
  if (!validPassword) {
    throw new HttpError(400, 'Invalid email or password');
  }

  const token = user.generateToken();

  res.send({ token, token_type: 'Bearer' });
});

export default router;
